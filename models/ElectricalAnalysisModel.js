
import { db } from '../db/connection.js';

class ElectricalAnalysisModel{

  constructor() {
    console.log('ElectricalAnalysisModel initialized');
  }

  unidadDeMedida = {
    'voltaje': 'Volt (V)',
    'corriente': 'Amper (A)',
    'potencia': 'Watt (W)',
    'frecuencia': 'Hertz (Hz)',
    'factor_potencia': 'Medida adimensional'
  };
     

  async getDato(idDispositivo, parametros, campo) {


    const consultaTodosLosValores = `
      SELECT m.${campo} AS valor, m.fecha_hora
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.id = ? AND m.fecha_hora BETWEEN ? AND ?
      ORDER BY m.fecha_hora ASC
    `;

    const consultaMinimoMaximo = `
      SELECT MIN(m.${campo}) AS minimo, MAX(m.${campo}) AS maximo
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.id = ? AND m.fecha_hora BETWEEN ? AND ?
    `;

    try {
      const [ [filas], [minimoYMaximo] ] = await Promise.all([
        db.query(consultaTodosLosValores, [idDispositivo, parametros.fechaInicio, parametros.fechaFinal]),
        db.query(consultaMinimoMaximo, [idDispositivo, parametros.fechaInicio, parametros.fechaFinal])
      ]);

      const fecha = await this.obtenerFechaActualStringTimestamp()

      if (!filas.length) {
        return {"id":idDispositivo, "fechaInicio": parametros.fechaInicio, "fechaFinal": parametros.fechaFinal, "tipoDeDato": campo, "UnidadDeMedida": this.unidadDeMedida[campo], "FechaDeConsulta": fecha, "datos": []};
      }

      const min = minimoYMaximo[0].minimo !== null ? minimoYMaximo[0].minimo : 0;
      const max = minimoYMaximo[0].maximo !== null ? minimoYMaximo[0].maximo : 0;

      return {"id":idDispositivo, "fechaInicio": parametros.fechaInicio, "fechaFinal": parametros.fechaFinal, "tipoDeDato": campo, "UnidadDeMedida": this.unidadDeMedida[campo], "FechaDeConsulta": fecha, "minimo": min, "maximo": max, "datos": filas};
      
    } catch (error) {
      console.error(`Error al obtener ${campo}:`, error);
      return [];
    }
  }
  
  mediciones = {
    getVoltaje: async (idDispositivo, parametros) => this.getDato(idDispositivo, parametros, 'voltaje'),
    getCorriente: async (idDispositivo, parametros) => this.getDato(idDispositivo, parametros, 'corriente'),
    getPotenciaActiva: async (idDispositivo, parametros) => this.getDato(idDispositivo, parametros, 'potencia'),
    getFrecuencia: async (idDispositivo, parametros) => this.getDato(idDispositivo, parametros, 'frecuencia'),
    getFactorPotencia: async (idDispositivo, parametros) => this.getDato(idDispositivo, parametros, 'factor_potencia')
};

async obtenerFechaActualStringTimestamp () {
  try{
    let date = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const año = date.getFullYear();
    const mes = pad(date.getMonth() + 1);
    const dia = pad(date.getDate());

    const horas = pad(date.getHours());
    const minutos = pad(date.getMinutes());
    const segundos = pad(date.getSeconds());

    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  }catch(error){
    return "Fecha no disponible"
  }
}


getConsumo = async (idDispositivo, parametros) => {
  try {
    const consultaPotencias = `
      SELECT m.potencia AS valor, m.fecha_hora
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.id = ? AND m.fecha_hora BETWEEN ? AND ?
      ORDER BY m.fecha_hora ASC
    `;

    const [filas] = await db.query(consultaPotencias, [idDispositivo, parametros.fechaInicio, parametros.fechaFinal]);

    if (!filas.length) {
      console.log('No se encontraron mediciones en ese periodo.');
      return { consumoTotalKWh: 0, consumosPorMedicion: [] };
    }

    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60; // Cada medición es 5 minutos = 0.0833 horas

    const consumosPorMedicion = filas.map(medicion => {
      const consumoKWh = (medicion.valor / 1000) * horasPorMedicion;
      return {
        fecha_hora: medicion.fecha_hora,
        potenciaW: medicion.valor,
        consumoKWh: consumoKWh
      };
    });

    const consumoTotalKWh = consumosPorMedicion.reduce((total, medicion) => total + medicion.consumoKWh, 0);

    let mayorConsumo = consumosPorMedicion[0];
    let menorConsumo = consumosPorMedicion[0];

    for (const medicion of consumosPorMedicion) {
      if (medicion.consumoKWh > mayorConsumo.consumoKWh) {
        mayorConsumo = medicion;
      }
      if (medicion.consumoKWh < menorConsumo.consumoKWh) {
        menorConsumo = medicion;
      }
    }

    return {"id":idDispositivo, "fechaInicio": parametros.fechaInicio, "fechaFinal": parametros.fechaFinal, "Consumo total": consumoTotalKWh, "tipoDeDato": "Consumo", "UnidadDeMedida": "Kilowat hora (kWh)", "FechaDeConsulta": this.obtenerFechaActualStringTimestamp, "minimo": menorConsumo, "maximo": mayorConsumo,"datos": consumosPorMedicion };

  } catch (error) {
    console.error('Error al calcular el consumo de kWh:', error);
    throw error;
  }
};

getConsumoActual = async (idSensor) => {
  try {
    // 1. Obtener última medición del sensor
    const consultaUltimaMedicion = `
      SELECT m.potencia AS valor, m.fecha_hora
      FROM mediciones m
      WHERE m.sensor_id = ?
      ORDER BY m.fecha_hora DESC
      LIMIT 1;
    `;
    const [filasMedicion] = await db.query(consultaUltimaMedicion, [idSensor]);

    if (!filasMedicion.length) {
      return {
        mensaje: "No hay mediciones disponibles para este sensor",
        consumoActual: 0,
        costoActualMXN: 0,
      };
    }

    const ultima = filasMedicion[0];

    // 2. Obtener datos del proveedor CFE
    const consultaProveedor = `SELECT * FROM proveedores WHERE nombre = 'CFE' LIMIT 1;`;
    const [filasProveedor] = await db.query(consultaProveedor);

    if (!filasProveedor.length) {
      throw new Error("No se encontró información del proveedor CFE.");
    }

    const proveedor = filasProveedor[0];

    // 3. Constantes de medición
    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60; // 0.0833 h
    const medicionesPorDia = 24 * 60 / minutosPorMedicion; // 288
    const diasPorMes = 30;
    const medicionesPorMes = medicionesPorDia * diasPorMes; // 8640

    // 4. Consumo actual en kWh (de una medición)
    const consumoActual = (ultima.valor / 1000) * horasPorMedicion;

    // 5. Costo variable por medición
    const costoVariable = consumoActual * proveedor.cargo_variable;

    // 6. Cargos fijos prorrateados por medición
    const prorrateoFijo = proveedor.cargo_fijo / medicionesPorMes;
    const prorrateoDistribucion = proveedor.cargo_distribucion / medicionesPorMes;
    const prorrateoCapacidad = proveedor.cargo_capacidad / medicionesPorMes;

    const costoTotalPorMedicion = costoVariable + prorrateoFijo + prorrateoDistribucion + prorrateoCapacidad;

    // 7. Estimación diaria y mensual
    const costoDiario = costoTotalPorMedicion * medicionesPorDia;
    const costoMensual = costoTotalPorMedicion * medicionesPorMes;

    return {
      sensor_id: idSensor,
      fechaMedicion: ultima.fecha_hora,
      potenciaW: ultima.valor,
      consumoActualKWh: consumoActual,
      costoPorMedicion: costoTotalPorMedicion.toFixed(2),
      estimacionCostoDiario: costoDiario.toFixed(2),
      estimacionCostoMensual: costoMensual.toFixed(2),
      unidad: "kWh",
      proveedor: proveedor.nombre,
      detalleTarifas: {
        cargo_variable: proveedor.cargo_variable,
        cargo_fijo: proveedor.cargo_fijo,
        cargo_distribucion: proveedor.cargo_distribucion,
        cargo_capacidad: proveedor.cargo_capacidad,
      },
      mensaje: "Costo estimado por consumo con base en tarifas reales del proveedor CFE",
    };
  } catch (error) {
    console.error("Error al obtener el consumo actual:", error);
    throw error;
  }
};



getConsumoPorDispositivosYGruposPorUsuario = async (id_usuario) => {
  try {
    // Obtener tarifas actuales de CFE
    const [tarifas] = await db.query(`
      SELECT * FROM proveedores WHERE nombre = 'CFE' LIMIT 1
    `);

    if (!tarifas.length) throw new Error("No se encontró información de tarifas");

    const tarifa = tarifas[0];
    const tarifaPorKWh = tarifa.cargo_variable;

    // Obtener todos los dispositivos con sensor asignado del usuario
    const [dispositivos] = await db.query(`
      SELECT d.id AS dispositivo_id, d.nombre, d.id_grupo, s.id AS sensor_id
      FROM dispositivos d
      INNER JOIN sensores s ON d.id_sensor = s.id
      WHERE d.usuario_id = ?
    `, [id_usuario]);

    if (!dispositivos.length) return { mensaje: "No hay dispositivos con sensores asignados para este usuario" };

    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60;

    let resultados = [];
    let grupos = {};

    for (const dispositivo of dispositivos) {
      const [mediciones] = await db.query(`
        SELECT potencia, fecha_hora FROM mediciones
        WHERE sensor_id = ?
        ORDER BY fecha_hora DESC
        LIMIT 1
      `, [dispositivo.sensor_id]);

      if (!mediciones.length) continue;

      const ultima = mediciones[0];
      const potencia = ultima.potencia;

      const consumoActual = (potencia / 1000) * horasPorMedicion;
      const costoActual = consumoActual * tarifaPorKWh;

      const consumoDiario = consumoActual * (60 / minutosPorMedicion) * 24; // 288 lecturas/día
      const consumoMensual = consumoDiario * 30;
      const costoDiario = consumoDiario * tarifaPorKWh;
      const costoMensual = consumoMensual * tarifaPorKWh;

      const resultado = {
        dispositivo_id: dispositivo.dispositivo_id,
        nombre: dispositivo.nombre,
        grupo_id: dispositivo.id_grupo,
        sensor_id: dispositivo.sensor_id,
        fechaMedicion: ultima.fecha_hora,
        potenciaW: potencia,
        consumoActual,
        consumoDiario,
        consumoMensual,
        costoActualMXN: costoActual,
        costoDiarioMXN: costoDiario,
        costoMensualMXN: costoMensual,
        tarifaAplicada: tarifaPorKWh,
        unidad: "kWh",
      };

      resultados.push(resultado);

      // Agrupar resultados por grupo
      if (!grupos[dispositivo.id_grupo]) {
        grupos[dispositivo.id_grupo] = {
          grupo_id: dispositivo.id_grupo,
          dispositivos: [],
          consumoTotal: 0,
          costoTotal: 0,
          consumoDiarioTotal: 0,
          costoDiarioTotal: 0,
          consumoMensualTotal: 0,
          costoMensualTotal: 0,
        };
      }

      grupos[dispositivo.id_grupo].dispositivos.push(resultado);
      grupos[dispositivo.id_grupo].consumoTotal += consumoActual;
      grupos[dispositivo.id_grupo].costoTotal += costoActual;
      grupos[dispositivo.id_grupo].consumoDiarioTotal += consumoDiario;
      grupos[dispositivo.id_grupo].costoDiarioTotal += costoDiario;
      grupos[dispositivo.id_grupo].consumoMensualTotal += consumoMensual;
      grupos[dispositivo.id_grupo].costoMensualTotal += costoMensual;
    }

    return {
      resumenDispositivos: resultados,
      resumenGrupos: Object.values(grupos),
    };
  } catch (error) {
    console.error("Error al obtener consumo por dispositivos y grupos del usuario:", error);
    throw error;
  }
};



}


export default ElectricalAnalysisModel;

