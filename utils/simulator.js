import 'dotenv/config';
import axios from 'axios';
import mysql from 'mysql2/promise';

const CONFIG = {
  API_URL: 'http://localhost:5051/electrical_analysis/mediciones/guardar', 
  USUARIO_ID: 24,
  
  // === CONFIGURACIÓN ===
  
  HORAS_HISTORIAL: 6,     // <--- CAMBIO: Solo 6 horas hacia atrás
  PASO_TIEMPO_MINUTOS: 5, // Diferencia de tiempo entre cada dato (timestamp)
  INTERVALO_ENVIO_REAL_MS: 5000, // Cada cuánto tiempo REAL se envían datos en LIVE

  // Variables Eléctricas (alineadas al payload real: V~126, I~2, P~260)
  VOLTAJE_BASE: 126, VOLTAJE_VAR: 2,     // 124-128
  CORRIENTE_BASE: 2.0, CORRIENTE_VAR: 0.2, // 1.8-2.2
  FACTOR_POT_MIN: 0.92, FACTOR_POT_MAX: 0.98,
  FRECUENCIA_BASE: 60, FRECUENCIA_VAR: 0.02,
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password2025',
  database: process.env.DB_NAME || 'powertrack',
  waitForConnections: true,
  connectionLimit: 10,
});

async function getSensoresUsuario24() {
  const [rows] = await pool.query(
    `SELECT d.id AS dispositivo_id, d.nombre AS dispositivo_nombre, s.mac_address
     FROM dispositivos d INNER JOIN sensores s ON d.id_sensor = s.id
     WHERE d.usuario_id = ? AND s.asignado = 1 ORDER BY d.id`,
    [CONFIG.USUARIO_ID]
  );
  return rows;
}

async function limpiarDatosUsuario() {
  console.log('🧹 Limpiando mediciones previas para iniciar limpio...');
  await pool.query(`
    DELETE m FROM mediciones m 
    INNER JOIN sensores s ON m.sensor_id = s.id 
    WHERE s.usuario_id = ?
  `, [CONFIG.USUARIO_ID]);
}

function generarMedicion(fecha, intervaloEnHoras) {
  const voltaje = CONFIG.VOLTAJE_BASE + (Math.random() * 2 - 1) * CONFIG.VOLTAJE_VAR;
  const corriente = CONFIG.CORRIENTE_BASE + (Math.random() * 2 - 1) * CONFIG.CORRIENTE_VAR;
  const fp = Math.random() * (CONFIG.FACTOR_POT_MAX - CONFIG.FACTOR_POT_MIN) + CONFIG.FACTOR_POT_MIN;
  
  const potencia = (voltaje * corriente) * fp;
  const energia = (potencia * intervaloEnHoras) / 1000;

  return {
    voltaje: Math.round(voltaje),                // Ej: 126
    corriente: parseFloat(corriente.toFixed(2)), // Ej: 2.00
    potencia: Math.round(potencia),              // Ej: 260
    factor_potencia: parseFloat(fp.toFixed(2)),
    energia: parseFloat(energia.toFixed(6)),
    frecuencia: parseFloat((CONFIG.FRECUENCIA_BASE + (Math.random() * 2 - 1) * CONFIG.FRECUENCIA_VAR).toFixed(2)),
    timestamp: fecha.toISOString()
  };
}

async function enviarMedicion(mac, medicion, nombre) {
  try {
    // Enviar MAC tal cual en DB (con dos puntos)
    await axios.post(CONFIG.API_URL, { mac_address: mac, ...medicion }, { timeout: 5000 });
    const timeStr = new Date(medicion.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return { success: true, dev: nombre, w: medicion.potencia, t: timeStr };
  } catch (error) {
    return { success: false, dev: nombre, err: error.message };
  }
}

async function iniciarSimulacion() {
  console.log(`⚡ SIMULADOR: -${CONFIG.HORAS_HISTORIAL} HORAS -> AHORA -> LIVE (+5min)`);
  
  try {
    await limpiarDatosUsuario();
    const sensores = await getSensoresUsuario24();
    console.log(`📡 Dispositivos encontrados: ${sensores.length}`);

    const ahoraReal = new Date();
    
    const offsetMinutos = CONFIG.PASO_TIEMPO_MINUTOS; // Detenemos 5 min antes
    const limiteHistorial = new Date(ahoraReal.getTime() - (offsetMinutos * 60 * 1000));
    
    // --- CALCULO DEL INICIO (6 HORAS ATRÁS) ---
    let relojSimulado = new Date(ahoraReal.getTime() - (CONFIG.HORAS_HISTORIAL * 60 * 60 * 1000));

    const horasPorPaso = CONFIG.PASO_TIEMPO_MINUTOS / 60;

    // --- FASE 1: RELLENO (Desde hace 6 horas hasta hace 5 minutos) ---
    console.log(`\n📚 FASE 1: Rellenando historial desde ${relojSimulado.toLocaleTimeString()} hasta ${limiteHistorial.toLocaleTimeString()}...`);
    
    while (relojSimulado < limiteHistorial) {
      const promesas = sensores.map(s => 
        enviarMedicion(s.mac_address, generarMedicion(relojSimulado, horasPorPaso), s.dispositivo_nombre)
      );
      await Promise.all(promesas);
      
      relojSimulado = new Date(relojSimulado.getTime() + (CONFIG.PASO_TIEMPO_MINUTOS * 60000));
      process.stdout.write('.'); 
    }
    
    console.log(`\n✅ Historial completado al día.`);

    // --- FASE 2: LIVE (Cada 5s avanza 5min) ---
    console.log('\n🔴 FASE 2: LIVE ACTIVO');
    console.log(`   - Simulando avance de 5 minutos cada 5 segundos reales.`);
    console.log('='.repeat(60));

    setInterval(async () => {
      // Avanzar reloj simulado
      relojSimulado = new Date(relojSimulado.getTime() + (CONFIG.PASO_TIEMPO_MINUTOS * 60000));

      console.log(`\n⏱️  LIVE | Simulando: ${relojSimulado.toLocaleTimeString()}`);

      const promesas = sensores.map(s => 
        enviarMedicion(s.mac_address, generarMedicion(relojSimulado, horasPorPaso), s.dispositivo_nombre)
      );

      const resultados = await Promise.all(promesas);
      
      resultados.forEach(r => {
        if(r.success) console.log(`   ✅ ${r.dev} \t| ${r.w} W \t| ${r.t}`);
        else console.log(`   ❌ ${r.dev} Error: ${r.err}`);
      });

    }, CONFIG.INTERVALO_ENVIO_REAL_MS);

  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

iniciarSimulacion();