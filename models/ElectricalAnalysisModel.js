
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
    console.log("Usuario recibido:", id_usuario);

    // Obtener tarifas CFE
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

    // Obtener dispositivos del usuario
    const [dispositivos] = await db.query(
      `SELECT id AS dispositivoId, nombre, id_grupo AS grupoId, id_sensor AS sensorId
       FROM dispositivos
       WHERE usuario_id = ?`,
      [id_usuario]
    );

    console.log(`Dispositivos encontrados: ${dispositivos.length}`);
    if (!dispositivos.length) return { mensaje: "No hay dispositivos para este usuario" };
    
    const [filasGrupos] = await db.query(
      `SELECT id, nombre FROM grupos WHERE id IN (?)`,
      [dispositivos.map(d => d.grupoId).filter(id => id !== null)]
    );

    const mapaNombreGrupo = filasGrupos.reduce((map, g) => {
      map[g.id] = g.nombre;
      return map;
    }, {});

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
      console.log(`Procesando dispositivo ID: ${dispositivo.dispositivoId}, sensor ID: ${dispositivo.sensorId}`);

      // Última medición del sensor
      const [filasMedicion] = await db.query(
        `SELECT potencia AS valor, fecha_hora
         FROM mediciones
         WHERE sensor_id = ?
         ORDER BY fecha_hora DESC
         LIMIT 1`,
        [dispositivo.sensorId]
      );

      let potenciaW = 0;
      let fecha_hora = null;

      if (filasMedicion.length) {
        potenciaW = parseFloat(filasMedicion[0].valor);
        fecha_hora = filasMedicion[0].fecha_hora;
      } else {
        console.warn(`No hay medición para sensor ${dispositivo.sensorId}`);
      }

      // Consumos y demanda (con potencia 0 si no hay medición)
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

      // Agrupar por grupo, asignar clave fija para null
      const grupoKey = dispositivo.grupoId ?? 'sin_grupo';

      if (!grupos[grupoKey]) {
        grupos[grupoKey] = {
          grupo_id: dispositivo.grupoId,
          nombre: mapaNombreGrupo[dispositivo.grupoId] || "Sin Grupo",
          dispositivos: [],
          consumoTotalKWh: 0,
          costoTotalMXN: 0,
          consumoDiarioTotalKWh: 0,
          costoDiarioTotalMXN: 0,
          consumoMensualTotalKWh: 0,
          costoMensualTotalMXN: 0,
        };
      }

      grupos[grupoKey].dispositivos.push(resultado);
      grupos[grupoKey].consumoTotalKWh += consumoMedicionKWh;
      grupos[grupoKey].costoTotalMXN += parseFloat(costoPorMedicion.toFixed(2));
      grupos[grupoKey].consumoDiarioTotalKWh += estimacionConsumoDiarioKWh;
      grupos[grupoKey].costoDiarioTotalMXN += parseFloat(estimacionCostoDiario.toFixed(2));
      grupos[grupoKey].consumoMensualTotalKWh += consumoMensualKWh;
      grupos[grupoKey].costoMensualTotalMXN += parseFloat(costoMensualTotal.toFixed(2));
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


getConsumoPorRango = async (idSensor, fechaInicio, fechaFin) => {
  try {

    const safeNumber = (value, defaultValue = 0) => {
      if (typeof value === "number" && !isNaN(value)) {
        return value;
      }
      const parsed = parseFloat(value);
      return typeof parsed === "number" && !isNaN(parsed) ? parsed : defaultValue;
    };

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
    // 3. Promedio histórico en rango o últimos 1 días
    // Si no hay fechas o están mal, usa últimos 1 días por defecto
    let queryFechaCondicion = '';
    let params = [idSensor];
    if (fechaInicio && fechaFin) {
      queryFechaCondicion = 'AND fecha_hora BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    } else {
      queryFechaCondicion = 'AND fecha_hora >= NOW() - INTERVAL 1 DAY';
    }

    const [historico] = await db.query(
      `SELECT AVG(potencia) AS promedio_potencia
       FROM mediciones
       WHERE sensor_id = ? ${queryFechaCondicion}`,
      params
    );
    const promedioPotenciaW = parseFloat(historico[0]?.promedio_potencia) || parseFloat(valor);

    // ————————————————————
    // 4. Cálculos base de consumo y costos (igual que antes)
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
        potenciaW: safeNumber(parseFloat(valor)),
        promedioPotenciaW: safeNumber(promedioPotenciaW),
        consumoActualKWh: safeNumber(consumoMedicionKWh),
        costoPorMedicion: safeNumber(costoPorMedicion),
        estimacionCostoDiario: safeNumber(estimacionCostoDiario),
        estimacionConsumoMensualKWh: safeNumber(consumoMensualKWh),
        estimacionDemandaKW: safeNumber(demandaKW),
        estimacionCostoMensual: safeNumber(costoMensualTotal),
        unidad: 'kWh',
        proveedor: proveedor.nombre,
        detalleTarifas: {
          cargo_variable: safeNumber(cargo_variable),
          cargo_capacidad: safeNumber(cargo_capacidad),
          cargo_distribucion: safeNumber(cargo_distribucion),
          cargo_fijo: safeNumber(cargo_fijo)
        },
        detalleCostos: {
          consumo: safeNumber(costoConsumo),
          capacidad: safeNumber(costoCapacidad),
          distribucion: safeNumber(costoDistribucion),
          fijo: safeNumber(costoFijo)
        },
        detalleCostosUnitarios: {
          costoPorKWh: safeNumber(costoPorKWh),
          costoPorKW: safeNumber(costoPorKW),
          costoPorKWDistribucion: safeNumber(costoPorKWDistribucion),
          costoFijoMensual: safeNumber(costoFijoMensual)
        },
        detallePorMedicion: {
          costoUnitarioPorMedicion: safeNumber(costoUnitarioPorMedicion),
          consumoPorMedicion: safeNumber(consumoPorMedicion)
        },
        detalleEstimacionDiaria: {
          estimacionCostoDiario: safeNumber(estimacionCostoDiario),
          estimacionConsumoDiario: safeNumber(estimacionConsumoDiario)
        },
        mensaje: fechaInicio && fechaFin
          ? `Estimación de consumo y costos para el rango ${fechaInicio} a ${fechaFin}.`
          : 'Estimación de consumo y costos según tarifas de CFE usando datos históricos (últimos 7 días si existen)'
      };

  } catch (error) {
    console.error('Error en getConsumoPorRango:', error);
    throw error;
  }
};
/*
getConsumoPorDispositivosYGruposPorUsuarioConRango = async (id_usuario, fechaInicio, fechaFin) => {
  try {
    console.log("Usuario recibido:", id_usuario);

    // Obtener tarifas CFE
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

    // Obtener dispositivos del usuario
    const [dispositivos] = await db.query(
      `SELECT id AS dispositivoId, nombre, id_grupo AS grupoId, id_sensor AS sensorId
       FROM dispositivos
       WHERE usuario_id = ?`,
      [id_usuario]
    );

    console.log(`Dispositivos encontrados: ${dispositivos.length}`);
    if (!dispositivos.length) return { mensaje: "No hay dispositivos para este usuario" };

    // Obtener nombres de grupos
    const [filasGrupos] = await db.query(
      `SELECT id, nombre FROM grupos WHERE id IN (?)`,
      [dispositivos.map(d => d.grupoId).filter(id => id !== null)]
    );

    const mapaNombreGrupo = filasGrupos.reduce((map, g) => {
      map[g.id] = g.nombre;
      return map;
    }, {});

    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60;
    const diasPorMes = 30;
    const medicionesPorDia = (24 * 60) / minutosPorMedicion;
    const medicionesPorMes = medicionesPorDia * diasPorMes;
    const factorCarga = 0.9;

    // 👇 Ajustamos la fechaFinReal al último dato disponible
    const [ultimaMedicion] = await db.query(`
      SELECT MAX(m.fecha_hora) AS ultima_fecha
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.usuario_id = ?
        AND m.fecha_hora BETWEEN ? AND ?
    `, [id_usuario, fechaInicio, fechaFin]);

    const fechaFinReal = ultimaMedicion[0]?.ultima_fecha || fechaFin;
    console.log("Fecha fin real detectada:", fechaFinReal);

    let resultados = [];
    let grupos = {};
    let consumoPorDia = {}; // Aquí guardamos el desglose diario

    for (const dispositivo of dispositivos) {
      console.log(`Procesando dispositivo ID: ${dispositivo.dispositivoId}, sensor ID: ${dispositivo.sensorId}`);

      // === Calcular promedio diario con fechas reales ===
      const [consumoDiarioRows] = await db.query(
        `SELECT DATE(fecha_hora) AS fecha, AVG(potencia) AS promedio_potencia
         FROM mediciones
         WHERE sensor_id = ? AND fecha_hora BETWEEN ? AND ?
         GROUP BY DATE(fecha_hora)`,
        [dispositivo.sensorId, fechaInicio, fechaFinReal]
      );

      consumoDiarioRows.forEach(row => {
        const fecha = row.fecha;
        const potenciaPromedio = parseFloat(row.promedio_potencia) || 0;
        const consumoDiaKWh = (potenciaPromedio / 1000) * 24; // promedio * 24h

        if (!consumoPorDia[fecha]) consumoPorDia[fecha] = 0;
        consumoPorDia[fecha] += consumoDiaKWh;
      });

      // === Calcular resumen mensual general (modelo original) ===
      let potenciaW = 0;
      let fecha_hora = null;

      if (fechaInicio && fechaFinReal) {
        const [promedioRow] = await db.query(
          `SELECT AVG(potencia) AS promedio_potencia
           FROM mediciones
           WHERE sensor_id = ? AND fecha_hora BETWEEN ? AND ?`,
          [dispositivo.sensorId, fechaInicio, fechaFinReal]
        );
        potenciaW = parseFloat(promedioRow[0]?.promedio_potencia) || 0;
        fecha_hora = `${fechaInicio} a ${fechaFinReal}`;
      } else {
        const [filasMedicion] = await db.query(
          `SELECT potencia AS valor, fecha_hora
           FROM mediciones
           WHERE sensor_id = ?
           ORDER BY fecha_hora DESC
           LIMIT 1`,
          [dispositivo.sensorId]
        );
        if (filasMedicion.length) {
          potenciaW = parseFloat(filasMedicion[0].valor);
          fecha_hora = filasMedicion[0].fecha_hora;
        }
      }

      const consumoMedicionKWh = (potenciaW / 1000) * horasPorMedicion;
      const consumoMensualKWh = consumoMedicionKWh * medicionesPorMes;
      const demandaKW = consumoMensualKWh / (24 * diasPorMes * factorCarga);

      const costoConsumo = consumoMensualKWh * cargo_variable;
      const costoCapacidad = demandaKW * cargo_capacidad;
      const costoDistribucion = demandaKW * cargo_distribucion;
      const costoFijo = cargo_fijo;
      const costoMensualTotal = costoConsumo + costoCapacidad + costoDistribucion + costoFijo;

      const costoPorMedicion = costoMensualTotal / medicionesPorMes;
      const estimacionCostoDiario = costoPorMedicion * medicionesPorDia;
      const estimacionConsumoDiarioKWh = consumoMedicionKWh * medicionesPorDia;

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

      const grupoKey = dispositivo.grupoId ?? 'sin_grupo';

      if (!grupos[grupoKey]) {
        grupos[grupoKey] = {
          grupo_id: dispositivo.grupoId,
          nombre: mapaNombreGrupo[dispositivo.grupoId] || "Sin Grupo",
          dispositivos: [],
          consumoTotalKWh: 0,
          costoTotalMXN: 0,
          consumoDiarioTotalKWh: 0,
          costoDiarioTotalMXN: 0,
          consumoMensualTotalKWh: 0,
          costoMensualTotalMXN: 0,
        };
      }

      grupos[grupoKey].dispositivos.push(resultado);
      grupos[grupoKey].consumoTotalKWh += consumoMedicionKWh;
      grupos[grupoKey].costoTotalMXN += parseFloat(costoPorMedicion.toFixed(2));
      grupos[grupoKey].consumoDiarioTotalKWh += estimacionConsumoDiarioKWh;
      grupos[grupoKey].costoDiarioTotalMXN += parseFloat(estimacionCostoDiario.toFixed(2));
      grupos[grupoKey].consumoMensualTotalKWh += consumoMensualKWh;
      grupos[grupoKey].costoMensualTotalMXN += parseFloat(costoMensualTotal.toFixed(2));
    }

    const consumoPorDiaArray = Object.entries(consumoPorDia).map(
      ([fecha, consumo]) => ({
        fecha,
        consumoKWh: consumo,
      })
    );

    return {
      resumenDispositivos: resultados,
      resumenGrupos: Object.values(grupos),
      consumoPorDia: consumoPorDiaArray,
      fechaInicio,
      fechaFinSolicitada: fechaFin,
      fechaFinReal
    };

  } catch (error) {
    console.error("Error en getConsumoPorDispositivosYGruposPorUsuarioConRango:", error);
    throw error;
  }
};
*/

getConsumoPorDispositivosYGruposPorUsuarioConRango = async (id_usuario, fechaInicio, fechaFin) => {
  try {
    console.log("Usuario recibido:", id_usuario);

    // Obtener tarifas CFE
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

    // Obtener dispositivos del usuario
    const [dispositivos] = await db.query(
      `SELECT id AS dispositivoId, nombre, id_grupo AS grupoId, id_sensor AS sensorId
       FROM dispositivos
       WHERE usuario_id = ?`,
      [id_usuario]
    );

    console.log(`Dispositivos encontrados: ${dispositivos.length}`);
    if (!dispositivos.length) return { mensaje: "No hay dispositivos para este usuario" };

    // Obtener nombres de grupos
    const [filasGrupos] = await db.query(
      `SELECT id, nombre FROM grupos WHERE id IN (?)`,
      [dispositivos.map(d => d.grupoId).filter(id => id !== null)]
    );

    const mapaNombreGrupo = filasGrupos.reduce((map, g) => {
      map[g.id] = g.nombre;
      return map;
    }, {});

    const segundosPorMedicion = 10; // 10 segundos
    const minutosPorMedicion = segundosPorMedicion / 60; // 0.1667 minutos
    const horasPorMedicion = minutosPorMedicion / 60; // 0.00278 horas
    const medicionesPorDia = (24 * 60 * 60) / segundosPorMedicion; // 8640 mediciones/día
    const diasPorMes = 30;
    const medicionesPorMes = medicionesPorDia * diasPorMes;
    const factorCarga = 0.9;

    // 👇 Ajustamos la fechaFinReal al último dato disponible
    const [ultimaMedicion] = await db.query(`
      SELECT MAX(m.fecha_hora) AS ultima_fecha
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.usuario_id = ?
        AND m.fecha_hora BETWEEN ? AND ?
    `, [id_usuario, fechaInicio, fechaFin]);

    const fechaFinReal = ultimaMedicion[0]?.ultima_fecha || fechaFin;
    console.log("Fecha fin real detectada:", fechaFinReal);

    let resultados = [];
    let grupos = {};
    let consumoPorDia = {}; // Aquí guardamos el desglose diario

    for (const dispositivo of dispositivos) {
      console.log(`Procesando dispositivo ID: ${dispositivo.dispositivoId}, sensor ID: ${dispositivo.sensorId}`);

      // === Calcular promedio diario con fechas reales ===
      const [consumoDiarioRows] = await db.query(
        `SELECT DATE(fecha_hora) AS fecha, AVG(potencia) AS promedio_potencia
         FROM mediciones
         WHERE sensor_id = ? AND fecha_hora BETWEEN ? AND ?
         GROUP BY DATE(fecha_hora)`,
        [dispositivo.sensorId, fechaInicio, fechaFinReal]
      );

      consumoDiarioRows.forEach(row => {
        const fecha = row.fecha;
        const potenciaPromedio = parseFloat(row.promedio_potencia) || 0;
        const consumoDiaKWh = (potenciaPromedio / 1000) * 24; // promedio * 24h

        if (!consumoPorDia[fecha]) consumoPorDia[fecha] = 0;
        consumoPorDia[fecha] += consumoDiaKWh;
      });

      // === Calcular resumen mensual general (modelo original) ===
      let potenciaW = 0;
      let fecha_hora = null;

      if (fechaInicio && fechaFinReal) {
        const [promedioRow] = await db.query(
          `SELECT AVG(potencia) AS promedio_potencia
           FROM mediciones
           WHERE sensor_id = ? AND fecha_hora BETWEEN ? AND ?`,
          [dispositivo.sensorId, fechaInicio, fechaFinReal]
        );
        potenciaW = parseFloat(promedioRow[0]?.promedio_potencia) || 0;
        fecha_hora = `${fechaInicio} a ${fechaFinReal}`;
      } else {
        const [filasMedicion] = await db.query(
          `SELECT potencia AS valor, fecha_hora
           FROM mediciones
           WHERE sensor_id = ?
           ORDER BY fecha_hora DESC
           LIMIT 1`,
          [dispositivo.sensorId]
        );
        if (filasMedicion.length) {
          potenciaW = parseFloat(filasMedicion[0].valor);
          fecha_hora = filasMedicion[0].fecha_hora;
        }
      }

      const consumoMedicionKWh = (potenciaW / 1000) * horasPorMedicion;
      const consumoMensualKWh = consumoMedicionKWh * medicionesPorMes;
      const demandaKW = consumoMensualKWh / (24 * diasPorMes * factorCarga);

      const costoConsumo = consumoMensualKWh * cargo_variable;
      const costoCapacidad = demandaKW * cargo_capacidad;
      const costoDistribucion = demandaKW * cargo_distribucion;
      const costoFijo = cargo_fijo;
      const costoMensualTotal = costoConsumo + costoCapacidad + costoDistribucion + costoFijo;

      const costoPorMedicion = costoMensualTotal / medicionesPorMes;
      const estimacionCostoDiario = costoPorMedicion * medicionesPorDia;
      const estimacionConsumoDiarioKWh = consumoMedicionKWh * medicionesPorDia;

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

      const grupoKey = dispositivo.grupoId ?? 'sin_grupo';

      if (!grupos[grupoKey]) {
        grupos[grupoKey] = {
          grupo_id: dispositivo.grupoId,
          nombre: mapaNombreGrupo[dispositivo.grupoId] || "Sin Grupo",
          dispositivos: [],
          consumoTotalKWh: 0,
          costoTotalMXN: 0,
          consumoDiarioTotalKWh: 0,
          costoDiarioTotalMXN: 0,
          consumoMensualTotalKWh: 0,
          costoMensualTotalMXN: 0,
        };
      }

      grupos[grupoKey].dispositivos.push(resultado);
      grupos[grupoKey].consumoTotalKWh += consumoMedicionKWh;
      grupos[grupoKey].costoTotalMXN += parseFloat(costoPorMedicion.toFixed(2));
      grupos[grupoKey].consumoDiarioTotalKWh += estimacionConsumoDiarioKWh;
      grupos[grupoKey].costoDiarioTotalMXN += parseFloat(estimacionCostoDiario.toFixed(2));
      grupos[grupoKey].consumoMensualTotalKWh += consumoMensualKWh;
      grupos[grupoKey].costoMensualTotalMXN += parseFloat(costoMensualTotal.toFixed(2));
    }

    const consumoPorDiaArray = Object.entries(consumoPorDia).map(
      ([fecha, consumo]) => ({
        fecha,
        consumoKWh: consumo,
      })
    );

    return {
      resumenDispositivos: resultados,
      resumenGrupos: Object.values(grupos),
      consumoPorDia: consumoPorDiaArray,
      fechaInicio,
      fechaFinSolicitada: fechaFin,
      fechaFinReal
    };

  } catch (error) {
    console.error("Error en getConsumoPorDispositivosYGruposPorUsuarioConRango:", error);
    throw error;
  }
};




async getHistorialResumenPorRango(idUsuario) {
  const [dispositivos] = await db.query(`
    SELECT d.id AS dispositivo_id
    FROM dispositivos d
    WHERE d.usuario_id = ?
  `, [idUsuario]);

  if (!dispositivos.length) return [];

  const idDispositivos = dispositivos.map(d => d.dispositivo_id);
  const placeholders = idDispositivos.map(() => '?').join(',');

  // Rango dinámico en días
  const rangosDias = {
    dia: 1,
    semana: 7,
    mes: 30,
    bimestre: 60
  };

  const now = new Date();
  const resultados = [];

  for (const [rango, dias] of Object.entries(rangosDias)) {
    let fechaInicioStr;
  const fechaFinal = now.toISOString().slice(0, 19).replace("T", " ");

  if (rango === "dia") {
    // Hoy a las 00:00:00
    const hoyInicio = new Date(now);
    hoyInicio.setHours(0, 0, 0, 0);
    fechaInicioStr = hoyInicio.toISOString().slice(0, 19).replace("T", " ");
  } else {
    // Días hacia atrás desde ahora
    const fechaInicio = new Date(now);
    fechaInicio.setDate(now.getDate() - dias);
    fechaInicioStr = fechaInicio.toISOString().slice(0, 19).replace("T", " ");
  }

    const [resumen] = await db.query(`
    SELECT 
      MIN((m.potencia / 1000) * 5 / 60) AS pmin,
      MAX((m.potencia / 1000) * 5 / 60) AS pmax,
      AVG((m.potencia / 1000) * 5 / 60) AS promedio
    FROM mediciones m
    INNER JOIN sensores s ON m.sensor_id = s.id
    INNER JOIN dispositivos d ON s.dispositivo_id = d.id
    WHERE d.id IN (${placeholders})
      AND m.fecha_hora BETWEEN ? AND ?
  `, [...idDispositivos, fechaInicioStr, fechaFinal]);

  const resultado = resumen[0] || {};

const parseOrZero = (val) =>
  val !== null && val !== undefined && !isNaN(Number(val))
    ? parseFloat(Number(val).toFixed(3))
    : 0;

const pmin = parseOrZero(resultado.pmin);
const pmax = parseOrZero(resultado.pmax);
const promedio = parseOrZero(resultado.promedio);

  resultados.push({
    rango,
    etiqueta: `Últimos ${dias} días`,
    pmin,
    pmax,
    promedio
  });
  }

  return resultados;
}
/*
async getHistorialDetalladoPorRango(idUsuario) {
  const [dispositivos] = await db.query(`
    SELECT d.id AS dispositivo_id
    FROM dispositivos d
    WHERE d.usuario_id = ?
  `, [idUsuario]);

  if (!dispositivos.length) return [];

  const idDispositivos = dispositivos.map(d => d.dispositivo_id);
  const placeholders = idDispositivos.map(() => '?').join(',');

  const rangos = [];

  const pad = (n) => n.toString().padStart(2, '0');
  const now = new Date();
{
  
  // Inicio del día en hora local
  const inicio = new Date(now);
  inicio.setHours(0, 0, 0, 0);

  // Formatear fechaInicio y fechaFinal en formato local: 'YYYY-MM-DD HH:mm:ss'
  const fechaInicio = `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-${pad(inicio.getDate())} 00:00:00`;
  const fechaFinal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const [rows] = await db.query(`
    SELECT 
      HOUR(m.fecha_hora) AS etiqueta,
      AVG((m.potencia / 1000) * 5 / 60) AS promedio
    FROM mediciones m
    INNER JOIN sensores s ON m.sensor_id = s.id
    INNER JOIN dispositivos d ON s.dispositivo_id = d.id
    WHERE d.id IN (${placeholders})
      AND m.fecha_hora BETWEEN ? AND ?
    GROUP BY etiqueta
    ORDER BY etiqueta
  `, [...idDispositivos, fechaInicio, fechaFinal]);

  rangos.push({
    rango: 'dia',
    detalles: rows.map(r => ({
      etiqueta: `${r.etiqueta.toString().padStart(2, '0')}:00 hrs`,
      promedio: parseFloat(Number(r.promedio).toFixed(3))
    }))
  });
}*/

  async getHistorialDetalladoPorRango(idUsuario, fechaInicioArg, fechaFinArg) {
    const [dispositivos] = await db.query(
      `SELECT d.id AS dispositivo_id FROM dispositivos d WHERE d.usuario_id = ?`,
      [idUsuario]
    );

    if (!dispositivos.length) return [];

    const idDispositivos = dispositivos.map((d) => d.dispositivo_id);
    const placeholders = idDispositivos.map(() => '?').join(',');

    const rangos = [];
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    // --- RANGO 'DIA' / ZOOM DINÁMICO ---
    {
      let fechaInicio;
      let fechaFinal;
      let formatoAgrupacion;

      if (fechaInicioArg && fechaFinArg) {
        fechaInicio = fechaInicioArg;
        formatoAgrupacion = '%Y-%m-%d %H:%i'; // group by minute for zoom

        // Use the latest measurement within the requested window as the real end
        const [[ultima]] = await db.query(
          `SELECT MAX(m.fecha_hora) AS ultima_fecha
           FROM mediciones m
           INNER JOIN sensores s ON m.sensor_id = s.id
           INNER JOIN dispositivos d ON s.dispositivo_id = d.id
           WHERE d.id IN (${placeholders})
             AND m.fecha_hora BETWEEN ? AND ?`,
          [...idDispositivos, fechaInicioArg, fechaFinArg]
        );
        fechaFinal = ultima?.ultima_fecha || fechaFinArg;
      } else {
        // Lógica por defecto (Todo el día actual)
        const inicio = new Date(now);
        inicio.setHours(0, 0, 0, 0);
        fechaInicio = `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-${pad(inicio.getDate())} 00:00:00`;
        fechaFinal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        // Agrupación por defecto (Hora)
        formatoAgrupacion = "%H";
      }

            const [rows] = await db.query(
        `SELECT 
           DATE_FORMAT(m.fecha_hora, '${formatoAgrupacion}') AS etiqueta,
           MIN(m.fecha_hora) AS fechaOrden,
           AVG((m.potencia / 1000) * 5 / 60) AS promedio
         FROM mediciones m
         INNER JOIN sensores s ON m.sensor_id = s.id
         INNER JOIN dispositivos d ON s.dispositivo_id = d.id
         WHERE d.id IN (${placeholders})
           AND m.fecha_hora BETWEEN ? AND ?
         GROUP BY etiqueta
         ORDER BY fechaOrden ASC`,
        [...idDispositivos, fechaInicio, fechaFinal]
      );

      rangos.push({
        rango: 'dia',
        detalles: rows.map((r) => ({
          etiqueta: formatoAgrupacion.includes('%i') ? r.etiqueta : `${r.etiqueta}:00`,
          promedio: parseFloat(Number(r.promedio).toFixed(3)),
        })),
      });
    }


  {
    const inicio = new Date(now);
    inicio.setDate(now.getDate() - 6);
    const fechaInicio = inicio.toISOString().slice(0, 19).replace("T", " ");
    const fechaFinal = now.toISOString().slice(0, 19).replace("T", " ");

    const [rows] = await db.query(`
      SELECT 
        DATE(m.fecha_hora) AS etiqueta,
        AVG((m.potencia / 1000) * 5 / 60) AS promedio
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.id IN (${placeholders})
        AND m.fecha_hora BETWEEN ? AND ?
      GROUP BY etiqueta
      ORDER BY etiqueta
    `, [...idDispositivos, fechaInicio, fechaFinal]);

    rangos.push({
      rango: 'semana',
      detalles: rows.map(r => {
        const fecha = new Date(r.etiqueta);
        const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
        const fechaLocal = fecha.toLocaleDateString('es-MX', opciones);
        return {
          etiqueta: fechaLocal,
          promedio: parseFloat(Number(r.promedio).toFixed(3))
        };
      })
    });
  }

  {
    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    const semanasMes = [];

    for (let i = 0; i < 4; i++) {
      const fin = new Date(now);
      fin.setDate(now.getDate() - (i * 7));
      const inicio = new Date(fin);
      inicio.setDate(fin.getDate() - 6);

      const fechaInicio = inicio.toISOString().slice(0, 19).replace("T", " ");
      const fechaFinal = fin.toISOString().slice(0, 19).replace("T", " ");

      const [rows] = await db.query(`
        SELECT 
          AVG((m.potencia / 1000) * 5 / 60) AS promedio
        FROM mediciones m
        INNER JOIN sensores s ON m.sensor_id = s.id
        INNER JOIN dispositivos d ON s.dispositivo_id = d.id
        WHERE d.id IN (${placeholders})
          AND m.fecha_hora BETWEEN ? AND ?
      `, [...idDispositivos, fechaInicio, fechaFinal]);

      const promedio = parseFloat(Number(rows[0].promedio ?? 0).toFixed(3));
      const etiqueta = `${inicio.toLocaleDateString('es-MX', opciones)} - ${fin.toLocaleDateString('es-MX', opciones)}`;

      semanasMes.unshift({ etiqueta, promedio }); // unshift para orden ascendente
    }

    rangos.push({
      rango: 'mes',
      detalles: semanasMes
    });
  }



  {
    const inicio = new Date(now);
    inicio.setMonth(now.getMonth() - 1);
    inicio.setDate(1);
    const fechaInicio = inicio.toISOString().slice(0, 19).replace("T", " ");
    const fechaFinal = now.toISOString().slice(0, 19).replace("T", " ");

    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(m.fecha_hora, '%Y-%m') AS etiqueta,
        AVG((m.potencia / 1000) * 5 / 60) AS promedio
      FROM mediciones m
      INNER JOIN sensores s ON m.sensor_id = s.id
      INNER JOIN dispositivos d ON s.dispositivo_id = d.id
      WHERE d.id IN (${placeholders})
        AND m.fecha_hora BETWEEN ? AND ?
      GROUP BY etiqueta
      ORDER BY etiqueta
    `, [...idDispositivos, fechaInicio, fechaFinal]);

    rangos.push({
      rango: 'bimestre',
      detalles: rows.map(r => ({
        etiqueta: new Date(`${r.etiqueta}-01`).toLocaleDateString('es-MX', {
          month: 'long',
          year: 'numeric'
        }),
        promedio: parseFloat(Number(r.promedio).toFixed(3))
      }))
    });
  }

  return rangos;
}




}


export default ElectricalAnalysisModel;

