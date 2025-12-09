import 'dotenv/config';
import axios from 'axios';
import mysql from 'mysql2/promise';

const CONFIG = {
  API_URL: 'http://localhost:5051/electrical_analysis/mediciones/guardar', 
  
  // TIEMPO REAL: Cada cuánto se ejecuta el script (puedes bajarlo a 1000ms si quieres que vaya más rápido)
  INTERVALO_ENVIO_MS: 5000, 
  
  // TIEMPO SIMULADO: Cada envío representa 5 minutos de datos
  INTERVALO_DATOS_MS: 300000, 
  
  USUARIO_ID: 24,
  VOLTAJE_BASE: 220, VOLTAJE_VAR: 10,
  CORRIENTE_BASE: 15, CORRIENTE_VAR: 2,
  FACTOR_POT_MIN: 0.85, FACTOR_POT_MAX: 0.95,
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
    `SELECT d.id AS dispositivo_id, d.nombre AS dispositivo_nombre, d.ubicacion, s.id AS sensor_id, s.mac_address
     FROM dispositivos d 
     INNER JOIN sensores s ON d.id_sensor = s.id
     WHERE d.usuario_id = ? AND s.asignado = 1 
     ORDER BY d.id`,
    [CONFIG.USUARIO_ID]
  );
  if (rows.length === 0) throw new Error(`No hay dispositivos con sensores asignados para usuario ${CONFIG.USUARIO_ID}`);
  return rows;
}

function generarMedicionConTimestamp(timestamp) {
  const voltaje = CONFIG.VOLTAJE_BASE + (Math.random() * 2 - 1) * CONFIG.VOLTAJE_VAR;
  const corriente = CONFIG.CORRIENTE_BASE + (Math.random() * 2 - 1) * CONFIG.CORRIENTE_VAR;
  const factorPotencia = Math.random() * (CONFIG.FACTOR_POT_MAX - CONFIG.FACTOR_POT_MIN) + CONFIG.FACTOR_POT_MIN;
  const frecuencia = CONFIG.FRECUENCIA_BASE + (Math.random() * 2 - 1) * CONFIG.FRECUENCIA_VAR;
  
  const potenciaAparente = voltaje * corriente;
  const potencia = potenciaAparente * factorPotencia;
  
  // Calculamos la energía correspondiente a 5 minutos (aunque el backend crea que son 10s)
  const horas = CONFIG.INTERVALO_DATOS_MS / 3600000; 
  const energia = (potencia * horas) / 1000;

  return {
    voltaje: parseFloat(voltaje.toFixed(2)),
    corriente: parseFloat(corriente.toFixed(2)),
    potencia: parseFloat(potencia.toFixed(2)),
    factor_potencia: parseFloat(factorPotencia.toFixed(2)),
    energia: parseFloat(energia.toFixed(6)),
    frecuencia: parseFloat(frecuencia.toFixed(2)),
    timestamp: timestamp.toISOString()
  };
}

async function enviarMedicion(macAddress, medicion, dispositivoNombre) {
  try {
    await axios.post(CONFIG.API_URL, { 
      mac_address: macAddress, 
      ...medicion 
    }, {
      headers: { 'Content-Type': 'application/json' }, 
      timeout: 5000
    });
    return { success: true, dispositivo: dispositivoNombre, potencia: medicion.potencia };
  } catch (error) {
    const mensaje = error.response ? `Status: ${error.response.status}` : error.message;
    return { success: false, dispositivo: dispositivoNombre, error: mensaje };
  }
}

async function simular() {
  console.log('⚡ Iniciando Simulador de Historial - Usuario ' + CONFIG.USUARIO_ID);
  
  try {
    const sensores = await getSensoresUsuario24();
    console.log(`📡 Dispositivos encontrados: ${sensores.length}`);
    sensores.forEach(s => console.log(`   - ${s.dispositivo_nombre} (${s.ubicacion})`));
    
    // === CAMBIO CLAVE AQUÍ ===
    // Empezamos la simulación 24 HORAS ATRÁS desde el momento actual
    let timestampActual = new Date(Date.now() - (24 * 60 * 60 * 1000));
    
    console.log('='.repeat(60));
    console.log(`🕒 Inicio simulación (fecha): ${timestampActual.toLocaleString()}`);
    console.log(`⏩ Velocidad: Avanzamos 5 minutos cada ${CONFIG.INTERVALO_ENVIO_MS/1000} segs reales.`);
    console.log('='.repeat(60));

    let contador = 0;

    const interval = setInterval(async () => {
      // Detener si llegamos al futuro
      if (timestampActual > new Date()) {
        console.log('\n🛑 ¡Alcanzamos el tiempo presente! Deteniendo script...');
        clearInterval(interval);
        await pool.end();
        process.exit(0);
      }

      contador++;
      console.log(`\n🔄 Ciclo #${contador} | Fecha Simulada: ${timestampActual.toLocaleString()}`);

      const promesas = sensores.map(s => 
        enviarMedicion(s.mac_address, generarMedicionConTimestamp(timestampActual), s.dispositivo_nombre)
      ); // Corregí la llamada aquí para usar la función wrapper correcta
      
      const resultados = await Promise.all(promesas);

      resultados.forEach(r => {
        if (r.success) console.log(`    ✅ ${r.dispositivo}: ${r.potencia} W`);
        else console.log(`    ❌ ${r.dispositivo}: Error -> ${r.error}`);
      });

      // Avanzar el tiempo simulado 5 minutos
      timestampActual = new Date(timestampActual.getTime() + CONFIG.INTERVALO_DATOS_MS);

    }, CONFIG.INTERVALO_ENVIO_MS);

    process.on('SIGINT', async () => {
      console.log('\n🛑 Deteniendo simulador...');
      clearInterval(interval);
      await pool.end();
      process.exit(0);
    });

  } catch (error) {
    console.error('🔥 Error fatal:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Función auxiliar wrapper
async function enviarMedicionConTimestamp(macAddress, timestamp, dispositivoNombre) {
    const medicion = generarMedicionConTimestamp(timestamp);
    return enviarMedicion(macAddress, medicion, dispositivoNombre);
}

simular();