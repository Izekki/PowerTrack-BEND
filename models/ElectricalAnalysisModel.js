
import AlertModel from './alertModel.js';
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
    // ————————————————————
    // 0. Obtener usuario, dispositivo e id_tipo_dispositivo
    const [dispRows] = await db.query(
      `SELECT id AS dispositivoId, usuario_id AS usuarioId, id_tipo_dispositivo AS idTipoDispositivo
       FROM dispositivos
       WHERE id_sensor = ?
       LIMIT 1`,
      [idSensor]
    );
    const dispositivo = dispRows[0] || {};
    const usuarioId = dispositivo.usuarioId || null;
    const idTipoDispositivo = dispositivo.idTipoDispositivo || null;
    const dispositivoId = dispositivo.dispositivoId || null;

    // ————————————————————
    // 1. Última medición
    const [filasMedicion] = await db.query(
      `SELECT potencia AS valor, fecha_hora
       FROM mediciones
       WHERE sensor_id = ?
       ORDER BY fecha_hora DESC
       LIMIT 1`,
      [idSensor]
    );
    if (!filasMedicion.length) {
      return {
        mensaje: "No hay mediciones disponibles para este sensor",
        consumoActual: 0,
        costoActualMXN: 0,
        estado: "Sin datos"
      };
    }
    const { valor, fecha_hora } = filasMedicion[0];

    // ————————————————————
    // 2. Datos de proveedor (CFE)
    const [filasProveedor] = await db.query(
      `SELECT nombre, cargo_variable, cargo_capacidad, cargo_distribucion, cargo_fijo
       FROM proveedores
       WHERE nombre = 'CFE'
       LIMIT 1`
    );
    if (!filasProveedor.length) {
      throw new Error("No se encontró información del proveedor CFE.");
    }
    const proveedor = filasProveedor[0];
    const cargo_variable = parseFloat(proveedor.cargo_variable || 0);
    const cargo_capacidad = parseFloat(proveedor.cargo_capacidad || 0);
    const cargo_distribucion = parseFloat(proveedor.cargo_distribucion || 0);
    const cargo_fijo = parseFloat(proveedor.cargo_fijo || 0);

    // ————————————————————
    // 3. Promedio histórico (últimos 7 días si existen)
    const [historico] = await db.query(
      `SELECT AVG(potencia) AS promedio_potencia
       FROM mediciones
       WHERE sensor_id = ?
         AND fecha_hora >= NOW() - INTERVAL 7 DAY`,
      [idSensor]
    );
    const promedioPotenciaW = parseFloat(historico[0]?.promedio_potencia) || parseFloat(valor);

    // ————————————————————
    // 4. Cálculos base de consumo y costos
    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60;
    const medicionesPorDia = (24 * 60) / minutosPorMedicion;
    const diasPorMes = 30;
    const medicionesPorMes = medicionesPorDia * diasPorMes;
    const factorCarga = 0.9;

    const consumoMedicionKWh = (promedioPotenciaW / 1000) * horasPorMedicion;
    const consumoMensualKWh = consumoMedicionKWh * medicionesPorMes;
    const demandaKW = consumoMensualKWh / (24 * diasPorMes * factorCarga);

    const costoConsumo = consumoMensualKWh * cargo_variable;
    const costoCapacidad = demandaKW * cargo_capacidad;
    const costoDistribucion = demandaKW * cargo_distribucion;
    const costoFijo = cargo_fijo;
    const costoMensualTotal = costoConsumo + costoCapacidad + costoDistribucion + costoFijo;

    const costoPorMedicion = costoMensualTotal / medicionesPorMes;
    const estimacionCostoDiario = costoPorMedicion * medicionesPorDia;
    const estimacionConsumoDiario = consumoMedicionKWh * medicionesPorDia;

    // ————————————————————
    // 5. Cálculos unitarios
    const costoPorKWh = cargo_variable;                     // $ por kWh
    const costoPorKW = cargo_capacidad;                    // $ por KW
    const costoPorKWDistribucion = cargo_distribucion;     // $ por KW de distribución
    const costoFijoMensual = cargo_fijo;                  // cargo fijo mensual
    const costoUnitarioPorMedicion = costoPorKWh * consumoMedicionKWh;
    const consumoPorMedicion = consumoMedicionKWh;

    // ————————————————————
    // 6. Retornar datos al cliente
    return {
      sensor_id: idSensor,
      fechaMedicion: fecha_hora,
      potenciaW: parseFloat(valor),
      promedioPotenciaW,
      consumoActualKWh: consumoMedicionKWh,
      costoPorMedicion,
      estimacionCostoDiario,
      estimacionConsumoMensualKWh: consumoMensualKWh,
      estimacionDemandaKW: demandaKW,
      estimacionCostoMensual: costoMensualTotal,
      unidad: 'kWh',
      proveedor: proveedor.nombre,
      detalleTarifas: {
        cargo_variable,
        cargo_capacidad,
        cargo_distribucion,
        cargo_fijo
      },
      detalleCostos: {
        consumo: costoConsumo,
        capacidad: costoCapacidad,
        distribucion: costoDistribucion,
        fijo: costoFijo
      },
      detalleCostosUnitarios: {
        costoPorKWh,
        costoPorKW,
        costoPorKWDistribucion,
        costoFijoMensual
      },
      detallePorMedicion: {
        costoUnitarioPorMedicion,
        consumoPorMedicion
      },
      detalleEstimacionDiaria: {
        estimacionCostoDiario,
        estimacionConsumoDiario
      },
      mensaje: 'Estimación de consumo y costos según tarifas de CFE usando datos históricos (últimos 7 días si existen)'
    };
  } catch (error) {
    console.error('Error en getConsumoActual:', error);
    throw error;
  }
};





getConsumoPorDispositivosYGruposPorUsuario = async (id_usuario) => {
  try {
    // ——— Obtener tarifas CFE (igual que en getConsumoActual)
    const [filasProveedor] = await db.query(
      `SELECT nombre, cargo_variable, cargo_capacidad, cargo_distribucion, cargo_fijo
       FROM proveedores
       WHERE nombre = 'CFE'
       LIMIT 1`
    );
    if (!filasProveedor.length) throw new Error("No se encontró información del proveedor CFE.");
    const proveedor = filasProveedor[0];
    const cargo_variable = parseFloat(proveedor.cargo_variable || 0);
    const cargo_capacidad = parseFloat(proveedor.cargo_capacidad || 0);
    const cargo_distribucion = parseFloat(proveedor.cargo_distribucion || 0);
    const cargo_fijo = parseFloat(proveedor.cargo_fijo || 0);

    // ——— Obtener dispositivos del usuario
    const [dispositivos] = await db.query(
      `SELECT id AS dispositivoId, nombre, id_grupo AS grupoId, id_sensor AS sensorId
       FROM dispositivos
       WHERE usuario_id = ?`,
      [id_usuario]
    );

    if (!dispositivos.length) return { mensaje: "No hay dispositivos para este usuario" };

    // Constantes
    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60;
    const medicionesPorDia = (24 * 60) / minutosPorMedicion;
    const diasPorMes = 30;
    const medicionesPorMes = medicionesPorDia * diasPorMes;
    const factorCarga = 0.9;

    let resultados = [];
    let grupos = {};

    for (const dispositivo of dispositivos) {
      // Última medición del sensor
      const [filasMedicion] = await db.query(
        `SELECT potencia AS valor, fecha_hora
         FROM mediciones
         WHERE sensor_id = ?
         ORDER BY fecha_hora DESC
         LIMIT 1`,
        [dispositivo.sensorId]
      );

      if (!filasMedicion.length) continue;

      const { valor, fecha_hora } = filasMedicion[0];
      const potenciaW = parseFloat(valor);

      // Consumos y demanda
      const consumoMedicionKWh = (potenciaW / 1000) * horasPorMedicion;
      const consumoMensualKWh = consumoMedicionKWh * medicionesPorMes;
      const demandaKW = consumoMensualKWh / (24 * diasPorMes * factorCarga);

      // Costos
      const costoConsumo = consumoMensualKWh * cargo_variable;
      const costoCapacidad = demandaKW * cargo_capacidad;
      const costoDistribucion = demandaKW * cargo_distribucion;
      const costoFijo = cargo_fijo;
      const costoMensualTotal = costoConsumo + costoCapacidad + costoDistribucion + costoFijo;

      const costoPorMedicion = costoMensualTotal / medicionesPorMes;
      const estimacionCostoDiario = costoPorMedicion * medicionesPorDia;
      const estimacionConsumoDiarioKWh = consumoMedicionKWh * medicionesPorDia;

      // Resultado por dispositivo
      const resultado = {
        dispositivo_id: dispositivo.dispositivoId,
        nombre: dispositivo.nombre,
        grupo_id: dispositivo.grupoId,
        sensor_id: dispositivo.sensorId,
        fechaMedicion: fecha_hora,
        potenciaW,
        consumoActualKWh: consumoMedicionKWh,
        consumoDiarioKWh: estimacionConsumoDiarioKWh,
        consumoMensualKWh,
        costoPorMedicionMXN: costoPorMedicion.toFixed(2),
        costoDiarioMXN: estimacionCostoDiario.toFixed(2),
        costoMensualMXN: costoMensualTotal.toFixed(2),
        unidad: "kWh",
        detalleTarifas: { cargo_variable, cargo_capacidad, cargo_distribucion, cargo_fijo },
        detalleCostos: { consumo: costoConsumo, capacidad: costoCapacidad, distribucion: costoDistribucion, fijo: costoFijo }
      };

      resultados.push(resultado);

      // Agrupar por grupo
      if (!grupos[dispositivo.grupoId]) {
        grupos[dispositivo.grupoId] = {
          grupo_id: dispositivo.grupoId,
          dispositivos: [],
          consumoTotalKWh: 0,
          costoTotalMXN: 0,
          consumoDiarioTotalKWh: 0,
          costoDiarioTotalMXN: 0,
          consumoMensualTotalKWh: 0,
          costoMensualTotalMXN: 0,
        };
      }

      grupos[dispositivo.grupoId].dispositivos.push(resultado);
      grupos[dispositivo.grupoId].consumoTotalKWh += consumoMedicionKWh;
      grupos[dispositivo.grupoId].costoTotalMXN += parseFloat(costoPorMedicion.toFixed(2));
      grupos[dispositivo.grupoId].consumoDiarioTotalKWh += estimacionConsumoDiarioKWh;
      grupos[dispositivo.grupoId].costoDiarioTotalMXN += parseFloat(estimacionCostoDiario.toFixed(2));
      grupos[dispositivo.grupoId].consumoMensualTotalKWh += consumoMensualKWh;
      grupos[dispositivo.grupoId].costoMensualTotalMXN += parseFloat(costoMensualTotal.toFixed(2));
    }

    return {
      resumenDispositivos: resultados,
      resumenGrupos: Object.values(grupos),
    };
  } catch (error) {
    console.error("Error en getConsumoPorDispositivosYGruposPorUsuario:", error);
    throw error;
  }
};


 async getHistorialConsumo(idUsuario) {
  const [dispositivos] = await db.query(`
    SELECT d.id AS dispositivo_id
    FROM dispositivos d
    WHERE d.usuario_id = ?
  `, [idUsuario]);

  if (!dispositivos.length) return [];

  const idDispositivos = dispositivos.map(d => d.dispositivo_id);
  const placeholders = idDispositivos.map(() => '?').join(',');

  const rangos = {
    dia: "DATE(m.fecha_hora)",
    semana: "YEARWEEK(m.fecha_hora, 1)",
    mes: "DATE_FORMAT(m.fecha_hora, '%Y-%m')",
    bimestre: "CONCAT(YEAR(m.fecha_hora), '-', LPAD(FLOOR((MONTH(m.fecha_hora) - 1) / 2) * 2 + 1, 2, '0'))"
  };

  const resultados = [];

  for (const [clave, agrupacion] of Object.entries(rangos)) {
    const [agrupados] = await db.query(`
      SELECT 
        ${agrupacion} AS etiqueta,
        MIN((m.potencia / 1000) * 5 / 60) AS pmin,
        MAX((m.potencia / 1000) * 5 / 60) AS pmax,
        AVG((m.potencia / 1000) * 5 / 60) AS promedio
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.id IN (${placeholders})
      GROUP BY etiqueta
      ORDER BY etiqueta DESC
      LIMIT 10;
    `, idDispositivos);

    const resumenes = agrupados.map(item => ({
      rango: clave,
      etiqueta: item.etiqueta,
      pmin: item.pmin != null ? parseFloat(Number(item.pmin).toFixed(3)) : 0,
      pmax: item.pmax != null ? parseFloat(Number(item.pmax).toFixed(3)) : 0,
      promedio: item.promedio != null ? parseFloat(Number(item.promedio).toFixed(3)) : 0
    }));


    resultados.push(...resumenes); // agregamos todos los registros del rango actual
  }

  return resultados;
}


}


export default ElectricalAnalysisModel;

