
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
    // 0. Obtener usuario y tipo de dispositivo desde 'dispositivos'
    const [dispRows] = await db.query(
      `SELECT usuario_id AS usuarioId, id_tipo_dispositivo AS idTipoDispositivo
       FROM dispositivos
       WHERE id_sensor = ?
       LIMIT 1`,
      [idSensor]
    );
    const dispositivo = dispRows[0] || {};
    const usuarioId = dispositivo.usuarioId || null;
    const idTipoDispositivo = dispositivo.idTipoDispositivo || null;

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
        costoActualMXN: 0
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
    const cargo_variable    = parseFloat(proveedor.cargo_variable   || 0);
    const cargo_capacidad   = parseFloat(proveedor.cargo_capacidad  || 0);
    const cargo_distribucion= parseFloat(proveedor.cargo_distribucion|| 0);
    const cargo_fijo        = parseFloat(proveedor.cargo_fijo       || 0);

    // ————————————————————
    // 3. Cálculos de consumo y costos
    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60;
    const medicionesPorDia = (24 * 60) / minutosPorMedicion;
    const diasPorMes = 30;
    const medicionesPorMes = medicionesPorDia * diasPorMes;
    const factorCarga = 0.9;

    const potenciaW = parseFloat(valor);
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

    // ————————————————————
    // 4. Cargar tipos de alerta
    const [tipos] = await db.query(
      `SELECT clave, id
       FROM tipos_alerta
       WHERE clave IN ('transicion_intermedia','riesgo_dac','dispositivo_alto_consumo','bajo_consumo')`
    );
    const mapaTipo = tipos.reduce((acc, { clave, id }) => {
      acc[clave] = id;
      return acc;
    }, {});

    // ————————————————————
    // Helper: evitar duplicados diarios
    const existeHoy = async (tipoAlertaId) => {
      if (!tipoAlertaId) return true;
      const [r] = await db.query(
        `SELECT 1
         FROM alertas
         WHERE sensor_id = ?
           AND tipo_alerta_id = ?
           AND DATE(fecha) = CURDATE()
         LIMIT 1`,
        [idSensor, tipoAlertaId]
      );
      return r.length > 0;
    };

    // ————————————————————
    // 5. Condiciones y creación de alertas

    // 5.1 Transición a consumo intermedio (151–280 kWh)
    if (consumoMensualKWh >= 151 && consumoMensualKWh <= 280) {
      const tipoId = mapaTipo.transicion_intermedia;
      if (!(await existeHoy(tipoId))) {
        await AlertModel.crear({
          usuarioId,
          mensaje: `Consumo estimado ${consumoMensualKWh.toFixed(2)} kWh: estás en rango intermedio (151–280).`,
          nivel: 'Medio',
          idTipoDispositivo,
          sensorId: idSensor,
          tipoAlertaId: tipoId
        });
      }
    }

    // 5.2 Riesgo de Tarifa DAC (> 250 kWh)
    if (consumoMensualKWh > 250) {
      const tipoId = mapaTipo.riesgo_dac;
      if (!(await existeHoy(tipoId))) {
        await AlertModel.crear({
          usuarioId,
          mensaje: `Consumo estimado ${consumoMensualKWh.toFixed(2)} kWh: riesgo de reclasificación a DAC.`,
          nivel: 'Alto',
          idTipoDispositivo,
          sensorId: idSensor,
          tipoAlertaId: tipoId
        });
      }
    }

    // 5.3 Dispositivo de alto consumo (> 0.83 kWh por medición)
    if (consumoMedicionKWh > 0.83) {
      const tipoId = mapaTipo.dispositivo_alto_consumo;
      if (!(await existeHoy(tipoId))) {
        await AlertModel.crear({
          usuarioId,
          mensaje: `Este sensor consumió ${consumoMedicionKWh.toFixed(2)} kWh en la última medición, sobre el promedio.`,
          nivel: 'Medio',
          idTipoDispositivo,
          sensorId: idSensor,
          tipoAlertaId: tipoId
        });
      }
    }

    // 5.4 Bajo consumo detectado (< 0.05 kWh por medición)
    if (consumoMedicionKWh < 0.05) {
      const tipoId = mapaTipo.bajo_consumo;
      if (!(await existeHoy(tipoId))) {
        await AlertModel.crear({
          usuarioId,
          mensaje: `Este sensor consumió solo ${consumoMedicionKWh.toFixed(2)} kWh: posible inactividad.`,
          nivel: 'Bajo',
          idTipoDispositivo,
          sensorId: idSensor,
          tipoAlertaId: tipoId
        });
      }
    }

    // ————————————————————
    // 6. Retornar al cliente
    return {
      sensor_id: idSensor,
      fechaMedicion: fecha_hora,
      potenciaW,
      consumoActualKWh: consumoMedicionKWh,
      costoPorMedicion,
      estimacionCostoDiario,
      estimacionConsumoMensualKWh: consumoMensualKWh,
      estimacionDemandaKW: demandaKW,
      estimacionCostoMensual: costoMensualTotal,
      unidad: 'kWh',
      proveedor: proveedor.nombre,
      detalleTarifas: { cargo_variable, cargo_capacidad, cargo_distribucion, cargo_fijo },
      detalleCostos: { consumo: costoConsumo, capacidad: costoCapacidad, distribucion: costoDistribucion, fijo: costoFijo },
      mensaje: 'Estimación de consumo y costos según tarifas de CFE'
    };
  } catch (error) {
    console.error('Error en getConsumoActual:', error);
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

    // Obtener dispositivos (con sensores) del usuario
    const [dispositivos] = await db.query(`
      SELECT d.id AS dispositivo_id, d.nombre, d.id_grupo, d.id_sensor
      FROM dispositivos d
      WHERE d.usuario_id = ?
    `, [id_usuario]);

    if (!dispositivos.length) return { mensaje: "No hay dispositivos para este usuario" };

    // Constantes
    const minutosPorMedicion = 5;
    const horasPorMedicion = minutosPorMedicion / 60; // 0.0833
    const medicionesPorDia = 24 * 60 / minutosPorMedicion; // 288
    const diasPorMes = 30;
    const medicionesPorMes = medicionesPorDia * diasPorMes;

    let resultados = [];
    let grupos = {};

    for (const dispositivo of dispositivos) {
      // Obtener última medición del sensor
      const [mediciones] = await db.query(`
        SELECT potencia, fecha_hora FROM mediciones
        WHERE sensor_id = ?
        ORDER BY fecha_hora DESC
        LIMIT 1
      `, [dispositivo.id_sensor]);

      if (!mediciones.length) continue;

      const ultima = mediciones[0];
      const potencia = ultima.potencia;

      // Consumo por medición en kWh
      const consumoActual = (potencia / 1000) * horasPorMedicion;

      // Costo variable por consumo
      const costoVariable = consumoActual * tarifa.cargo_variable;

      // Cargos prorrateados por medición
      const prorrateoFijo = tarifa.cargo_fijo / medicionesPorMes;
      const prorrateoDistribucion = tarifa.cargo_distribucion / medicionesPorMes;
      const prorrateoCapacidad = tarifa.cargo_capacidad / medicionesPorMes;

      const costoPorMedicion = costoVariable + prorrateoFijo + prorrateoDistribucion + prorrateoCapacidad;

      // Estimaciones
      const consumoDiario = consumoActual * medicionesPorDia;
      const consumoMensual = consumoDiario * diasPorMes;

      const costoDiario = costoPorMedicion * medicionesPorDia;
      const costoMensual = costoPorMedicion * medicionesPorMes;

      const resultado = {
        dispositivo_id: dispositivo.dispositivo_id,
        nombre: dispositivo.nombre,
        grupo_id: dispositivo.id_grupo,
        sensor_id: dispositivo.id_sensor,
        fechaMedicion: ultima.fecha_hora,
        potenciaW: potencia,
        consumoActualKWh: consumoActual,
        consumoDiarioKWh: consumoDiario,
        consumoMensualKWh: consumoMensual,
        costoPorMedicionMXN: costoPorMedicion.toFixed(2),
        costoDiarioMXN: costoDiario.toFixed(2),
        costoMensualMXN: costoMensual.toFixed(2),
        unidad: "kWh",
        detalleTarifas: {
          cargo_variable: tarifa.cargo_variable,
          cargo_fijo: tarifa.cargo_fijo,
          cargo_distribucion: tarifa.cargo_distribucion,
          cargo_capacidad: tarifa.cargo_capacidad,
        }
      };

      resultados.push(resultado);

      // Agrupar resultados por grupo
      if (!grupos[dispositivo.id_grupo]) {
        grupos[dispositivo.id_grupo] = {
          grupo_id: dispositivo.id_grupo,
          dispositivos: [],
          consumoTotalKWh: 0,
          costoTotalMXN: 0,
          consumoDiarioTotalKWh: 0,
          costoDiarioTotalMXN: 0,
          consumoMensualTotalKWh: 0,
          costoMensualTotalMXN: 0,
        };
      }

      grupos[dispositivo.id_grupo].dispositivos.push(resultado);
      grupos[dispositivo.id_grupo].consumoTotalKWh += consumoActual;
      grupos[dispositivo.id_grupo].costoTotalMXN += parseFloat(costoPorMedicion.toFixed(2));
      grupos[dispositivo.id_grupo].consumoDiarioTotalKWh += consumoDiario;
      grupos[dispositivo.id_grupo].costoDiarioTotalMXN += parseFloat(costoDiario.toFixed(2));
      grupos[dispositivo.id_grupo].consumoMensualTotalKWh += consumoMensual;
      grupos[dispositivo.id_grupo].costoMensualTotalMXN += parseFloat(costoMensual.toFixed(2));
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

