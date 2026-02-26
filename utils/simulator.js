import 'dotenv/config';
import axios from 'axios';
import mysql from 'mysql2/promise';

const CONFIG = {
  API_BASE_URL: 'http://localhost:5051',
  API_URL: 'http://localhost:5051/electrical_analysis/mediciones/guardar',
  LOGIN_URL: 'http://localhost:5051/login',
  USUARIO_ID: 1,
  
  // === CONFIGURACIÓN ===
  
  HORAS_HISTORIAL: 6,     // <--- CAMBIO: Solo 6 horas hacia atrás
  PASO_TIEMPO_MINUTOS: 5, // Diferencia de tiempo entre cada dato (timestamp)
  INTERVALO_ENVIO_REAL_MS: 5000, // Cada cuánto tiempo REAL se envían datos en LIVE

  // Realismo adicional
  HORA_ACTIVA_INICIO: 7,
  HORA_ACTIVA_FIN: 22,
  PROB_APAGADO_FUERA_HORARIO: 0.85,
  PROB_APAGADO_DENTRO_HORARIO: 0.15,
  PROB_HUECO_DATOS: 0.05,
  PROB_PICO_ARRANQUE: 0.08,
  PICO_MULTIPLICADOR_MIN: 1.2,
  PICO_MULTIPLICADOR_MAX: 1.6,

  // Variables Eléctricas (alineadas al payload real: V~126, I~2, P~260)
  VOLTAJE_BASE: 126, VOLTAJE_VAR: 2,     // 124-128
  CORRIENTE_BASE: 2.0, CORRIENTE_VAR: 0.2, // 1.8-2.2
  FACTOR_POT_MIN: 0.92, FACTOR_POT_MAX: 0.98,
  FRECUENCIA_BASE: 60, FRECUENCIA_VAR: 0.02,
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

let cachedToken = null;

async function getAuthToken() {
  if (process.env.SIMULATOR_TOKEN) {
    return process.env.SIMULATOR_TOKEN;
  }

  if (cachedToken) {
    return cachedToken;
  }

  const email = process.env.SIMULATOR_EMAIL;
  const password = process.env.SIMULATOR_PASSWORD;

  if (!email || !password) {
    throw new Error('Falta SIMULATOR_TOKEN o SIMULATOR_EMAIL/SIMULATOR_PASSWORD en el .env');
  }

  const response = await axios.post(
    CONFIG.LOGIN_URL,
    { email, password },
    { timeout: 5000 }
  );

  const token = response?.data?.token;
  if (!token) {
    throw new Error('No se recibio token al iniciar sesion en /login');
  }

  cachedToken = token;
  return cachedToken;
}

async function getSensoresUsuario24() {
  const [rows] = await pool.query(
    `SELECT
       d.id AS dispositivo_id,
       d.nombre AS dispositivo_nombre,
       d.id_tipo_dispositivo AS tipo_id,
       td.consumo_minimo_w,
       td.consumo_maximo_w,
       s.mac_address
     FROM dispositivos d
     INNER JOIN sensores s ON d.id_sensor = s.id
     LEFT JOIN tipos_dispositivos td ON d.id_tipo_dispositivo = td.id
     WHERE d.usuario_id = ? AND s.asignado = 1
     ORDER BY d.id`,
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

function generarMedicion(fecha, intervaloEnHoras, consumoMinW, consumoMaxW) {
  const voltaje = CONFIG.VOLTAJE_BASE + (Math.random() * 2 - 1) * CONFIG.VOLTAJE_VAR;
  const fp = Math.random() * (CONFIG.FACTOR_POT_MAX - CONFIG.FACTOR_POT_MIN) + CONFIG.FACTOR_POT_MIN;

  const minW = Number.isFinite(consumoMinW) ? consumoMinW : null;
  const maxW = Number.isFinite(consumoMaxW) ? consumoMaxW : null;

  let potencia;
  let corriente;
  const hora = fecha.getHours();
  const dentroHorario = hora >= CONFIG.HORA_ACTIVA_INICIO && hora < CONFIG.HORA_ACTIVA_FIN;
  const probApagado = dentroHorario
    ? CONFIG.PROB_APAGADO_DENTRO_HORARIO
    : CONFIG.PROB_APAGADO_FUERA_HORARIO;
  const apagado = Math.random() < probApagado;

  if (apagado) {
    potencia = 0;
    corriente = 0;
  } else if (minW !== null && maxW !== null && maxW > 0 && maxW >= minW) {
    potencia = minW + Math.random() * (maxW - minW);
    corriente = potencia / (voltaje * fp);
  } else {
    corriente = CONFIG.CORRIENTE_BASE + (Math.random() * 2 - 1) * CONFIG.CORRIENTE_VAR;
    potencia = (voltaje * corriente) * fp;
  }

  if (!apagado && Math.random() < CONFIG.PROB_PICO_ARRANQUE) {
    const mult = CONFIG.PICO_MULTIPLICADOR_MIN + Math.random() * (CONFIG.PICO_MULTIPLICADOR_MAX - CONFIG.PICO_MULTIPLICADOR_MIN);
    potencia *= mult;
    corriente = potencia / (voltaje * fp);
  }

  const energia = (potencia * intervaloEnHoras) / 1000;

  return {
    voltaje: Math.round(voltaje),
    corriente: parseFloat(corriente.toFixed(2)),
    potencia: Math.round(potencia),
    factor_potencia: parseFloat(fp.toFixed(2)),
    energia: parseFloat(energia.toFixed(6)),
    frecuencia: parseFloat((CONFIG.FRECUENCIA_BASE + (Math.random() * 2 - 1) * CONFIG.FRECUENCIA_VAR).toFixed(2)),
    timestamp: fecha.toISOString()
  };
}

async function enviarMedicion(mac, medicion, nombre) {
  try {
    if (Math.random() < CONFIG.PROB_HUECO_DATOS) {
      return { success: false, dev: nombre, err: 'Omitido (hueco de datos)' };
    }
    // Enviar MAC tal cual en DB (con dos puntos)
    const token = await getAuthToken();
    await axios.post(
      CONFIG.API_URL,
      { mac_address: mac, ...medicion },
      {
        timeout: 5000,
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const timeStr = new Date(medicion.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return { success: true, dev: nombre, w: medicion.potencia, t: timeStr };
  } catch (error) {
    if (error?.response?.status === 401) {
      cachedToken = null;
      try {
        const token = await getAuthToken();
        await axios.post(
          CONFIG.API_URL,
          { mac_address: mac, ...medicion },
          {
            timeout: 5000,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const timeStr = new Date(medicion.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return { success: true, dev: nombre, w: medicion.potencia, t: timeStr };
      } catch (retryError) {
        return { success: false, dev: nombre, err: retryError.message };
      }
    }
    return { success: false, dev: nombre, err: error.message };
  }
}

async function iniciarSimulacion() {
  console.log(`⚡ SIMULADOR: -${CONFIG.HORAS_HISTORIAL} HORAS -> AHORA -> LIVE (+5min)`);
  
  try {
    await limpiarDatosUsuario();
    const sensoresRaw = await getSensoresUsuario24();
    const sensores = sensoresRaw.map((s) => ({
      ...s,
      consumo_minimo_w: s.consumo_minimo_w !== null ? Number(s.consumo_minimo_w) : null,
      consumo_maximo_w: s.consumo_maximo_w !== null ? Number(s.consumo_maximo_w) : null
    }));
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
        enviarMedicion(
          s.mac_address,
          generarMedicion(relojSimulado, horasPorPaso, s.consumo_minimo_w, s.consumo_maximo_w),
          s.dispositivo_nombre
        )
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
        enviarMedicion(
          s.mac_address,
          generarMedicion(relojSimulado, horasPorPaso, s.consumo_minimo_w, s.consumo_maximo_w),
          s.dispositivo_nombre
        )
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