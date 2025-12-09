import 'dotenv/config';
import axios from 'axios';
import mysql from 'mysql2/promise';

const CONFIG = {
  API_URL: 'http://localhost:5051/electrical_analysis/mediciones/guardar', 
  USUARIO_ID: 24,
  
  // === CONFIGURACIÓN UNIFICADA ===
  
  // FASE 1: RELLENO
  HORAS_ATRAS_INICIO: 24, 
  // ESTE ES EL VALOR CLAVE: Define la separación entre puntos (Historial Y Live)
  PASO_TIEMPO_MINUTOS: 10, 

  // FASE 2: VELOCIDAD VISUAL
  // Cada cuánto tiempo REAL vemos aparecer un nuevo punto en la gráfica
  INTERVALO_ENVIO_REAL_MS: 5000, // Cada 5 segundos reales (ajusta a tu gusto)

  // Variables Eléctricas
  VOLTAJE_BASE: 120, VOLTAJE_VAR: 5,
  CORRIENTE_BASE: 2, CORRIENTE_VAR: 1,
  FACTOR_POT_MIN: 0.90, FACTOR_POT_MAX: 0.99,
  FRECUENCIA_BASE: 60, FRECUENCIA_VAR: 0.1,
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

// Limpieza para evitar conflictos o datos dobles
async function limpiarDatosUsuario() {
  console.log('🧹 Limpiando mediciones...');
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
    voltaje: parseFloat(voltaje.toFixed(2)),
    corriente: parseFloat(corriente.toFixed(2)),
    potencia: parseFloat(potencia.toFixed(2)),
    factor_potencia: parseFloat(fp.toFixed(2)),
    energia: parseFloat(energia.toFixed(6)),
    frecuencia: parseFloat((CONFIG.FRECUENCIA_BASE + Math.random() * 0.1).toFixed(2)),
    timestamp: fecha.toISOString()
  };
}

async function enviarMedicion(mac, medicion, nombre) {
  try {
    await axios.post(CONFIG.API_URL, { mac_address: mac, ...medicion }, { timeout: 5000 });
    return { success: true, dev: nombre, w: medicion.potencia, t: medicion.timestamp };
  } catch (error) {
    return { success: false, dev: nombre, err: error.message };
  }
}

async function iniciarSimulacion() {
  console.log('⚡ SIMULADOR CONSISTENTE - USUARIO ' + CONFIG.USUARIO_ID);
  
  try {
    await limpiarDatosUsuario();
    const sensores = await getSensoresUsuario24();
    console.log(`📡 Dispositivos encontrados: ${sensores.length}`);

    // --- FASE 1: RELLENO HISTÓRICO ---
    console.log('\n📚 FASE 1: Rellenando historial...');
    
    // Inicia 24h atrás
    let relojSimulado = new Date(Date.now() - (CONFIG.HORAS_ATRAS_INICIO * 60 * 60 * 1000));
    const ahoraReal = new Date();
    
    // Límite: Fin del día actual
    const finDelDia = new Date(ahoraReal);
    finDelDia.setHours(23, 59, 59, 999); 

    const horasPorPaso = CONFIG.PASO_TIEMPO_MINUTOS / 60;

    // Rellenamos hasta alcanzar la hora actual
    while (relojSimulado < ahoraReal) {
      const promesas = sensores.map(s => 
        enviarMedicion(s.mac_address, generarMedicion(relojSimulado, horasPorPaso), s.dispositivo_nombre)
      );
      await Promise.all(promesas);
      
      relojSimulado = new Date(relojSimulado.getTime() + (CONFIG.PASO_TIEMPO_MINUTOS * 60000));
      process.stdout.write('.');
    }
    console.log(`\n✅ Historial al día. Último dato: ${relojSimulado.toLocaleTimeString()}`);

    // --- FASE 2: MODO EN VIVO (CONTINUO) ---
    console.log('\n🔴 FASE 2: Iniciando LIVE (Consistente)');
    console.log(`   - Cada ${CONFIG.INTERVALO_ENVIO_REAL_MS/1000}s reales, avanza ${CONFIG.PASO_TIEMPO_MINUTOS} minutos.`);
    console.log('='.repeat(60));

    const intervaloID = setInterval(async () => {
      
      // AVANZAMOS EL MISMO INTERVALO QUE EN EL HISTORIAL (10 MINUTOS)
      // Esto elimina el "salto raro" o inconsistencia
      relojSimulado = new Date(relojSimulado.getTime() + (CONFIG.PASO_TIEMPO_MINUTOS * 60000));
      
      if (relojSimulado > finDelDia) {
        console.log(`\n🏁 FIN DEL DÍA (${relojSimulado.toLocaleTimeString()}).`);
        clearInterval(intervaloID);
        process.exit(0);
        return;
      }

      console.log(`\n⏱️  LIVE | Simulando: ${relojSimulado.toLocaleTimeString()}`);

      const promesas = sensores.map(s => 
        enviarMedicion(s.mac_address, generarMedicion(relojSimulado, horasPorPaso), s.dispositivo_nombre)
      );

      const resultados = await Promise.all(promesas);
      resultados.forEach(r => {
        if(r.success) console.log(`   ✅ ${r.dev}: ${r.w} W`);
      });

    }, CONFIG.INTERVALO_ENVIO_REAL_MS);

  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

iniciarSimulacion();