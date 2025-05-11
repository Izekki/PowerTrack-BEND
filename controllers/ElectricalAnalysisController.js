import ElectricalAnalysisModel from "../models/ElectricalAnalysisModel.js";
import {getAllDeviceForUserFromDB,getDeviceByIdFromDB} from "../models/deviceModel.js";

class ElectricalAnalysisController {

  constructor() {
     this.electricalAnalysisModel = new ElectricalAnalysisModel();

  this.apiMethodsInfo = [
    {
      "Path": "/electrical_analysis/voltaje_d/:id",
      "Request Type":"GET",
      "Path params": "id (int)",
      "Query params": "fechaInicio (YYYY:MM:DD hh:mm:ss), fechaFinal (YYYY:MM:DD hh:mm:ss)",
      "Description":"Obtener el voltaje de un dipositivo en un periodo de tiempo"
    },
    {
      "Path": "/electrical_analysis/corriente_d/:id",
      "Request Type":"GET",
      "Path params": "id (int)",
      "Query params": "fechaInicio (YYYY:MM:DD hh:mm:ss), fechaFinal (YYYY:MM:DD hh:mm:ss)",
      "Description":"Obtener la corriente electrica de un dispositivo en un periodo de tiempo"
    },
    {
      "Path": "/electrical_analysis/potencia_activa_d/:id",
      "Request Type":"GET",
      "Path params": "id (int)",
      "Query params": "fechaInicio (YYYY:MM:DD hh:mm:ss), fechaFinal (YYYY:MM:DD hh:mm:ss)",
      "Description":"Obtener la potencia activa de un dispositivo en un periodo de tiempo"
    },
    {
      "Path": "/electrical_analysis/frecuencia_d/:id",
      "Request Type":"GET",
      "Path params": "id (int)",
      "Query params": "fechaInicio (YYYY:MM:DD hh:mm:ss), fechaFinal (YYYY:MM:DD hh:mm:ss)",
      "Description":"Obtener la frecuencia de un dispositivo en un periodo de tiempo"
    },
    {
      "Path": "/electrical_analysis/factor_potencia_d/:id",
      "Tipo de peticion HTTP":"GET", 
      "Path params": "id (int)",
      "Query params": "fechaInicio (YYYY:MM:DD hh:mm:ss), fechaFinal (YYYY:MM:DD hh:mm:ss)",
      "Description":"Obtener el factor de potencia de un dispositivo en un periodo de tiempo"
    },
    {
      "Path": "/electrical_analysis/consumo_d/:id",
      "Tipo de peticion HTTP":"GET", 
      "Path params": "id (int)",
      "Query params": "fechaInicio (YYYY:MM:DD hh:mm:ss), fechaFinal (YYYY:MM:DD hh:mm:ss)",
      "Description":"Obtener el consumo de un dispositivo en un periodo de tiempo"
    },
   ]
  }


  getInfoApi = (req, res) => {
    res.status(200).json({'message': 'Metodos de la API', 'metodos': this.apiMethodsInfo });
  }

  getVoltaje = async (req, res) => {

    const { id } = req.params;
    const { fechaInicio, fechaFinal } = req.query;
    const validacion = this.validateParams(id, { fechaInicio, fechaFinal });



    if (validacion !== true) {
      return res.status(400).json({ message: validacion });
    }

    try {
      const datos = await this.electricalAnalysisModel.mediciones.getVoltaje(
        id,
        { fechaInicio, fechaFinal }
      );
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener el voltaje", error: error.message });
    }
  };

  getCorriente = async (req, res) => {
    const { id } = req.params;
    const { fechaInicio, fechaFinal } = req.query;
   const validacion = this.validateParams(id, { fechaInicio, fechaFinal });


    if (validacion !== true) {
      return res.status(400).json({ message: validacion });
    }

    try {
      const datos = await this.electricalAnalysisModel.mediciones.getCorriente(
        id,
        { fechaInicio, fechaFinal }
      );
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener la corriente",
          error: error.message,
        });
    }
  };

  getPotenciaActiva = async (req, res) => {
    const { id } = req.params;
    const { fechaInicio, fechaFinal } = req.query;
   const validacion = this.validateParams(id, { fechaInicio, fechaFinal });

    
    if (validacion !== true) {
      return res.status(400).json({ message: validacion });
    }

    try {
      const datos = await this.electricalAnalysisModel.mediciones.getPotenciaActiva(
        id,
        { fechaInicio, fechaFinal }
      );
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener la potencia activa",
          error: error.message,
        });
    }
  };

  getFrecuencia = async (req, res) => {
    const { id } = req.params;
    const { fechaInicio, fechaFinal } = req.query;
   const validacion = this.validateParams(id, { fechaInicio, fechaFinal });

    
    if (validacion !== true) {
      return res.status(400).json({ message: validacion });
    }

    try {
      const datos = await this.electricalAnalysisModel.mediciones.getFrecuencia(
        id,
        { fechaInicio, fechaFinal }
      );
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener la frecuencia",
          error: error.message,
        });
    }
  };

  getFactorPotencia = async (req, res) => {
    const { id } = req.params;
    const { fechaInicio, fechaFinal } = req.query;
   const validacion = this.validateParams(id,  {fechaInicio, fechaFinal});

    
    if (validacion !== true) {
      return res.status(400).json({ message: validacion });
    }

    try {
      const datos = await this.electricalAnalysisModel.mediciones.getFactorPotencia(
        id,
        { fechaInicio, fechaFinal }
      );
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener el factor de potencia",
          error: error.message,
        });
    }
  };


  getConsumo = async (req, res) => {

    const { id } = req.params;
    const { fechaInicio, fechaFinal } = req.query;
  
    const validacion = this.validateParams(id, { fechaInicio, fechaFinal });



    if (validacion !== true) {
      return res.status(400).json({ message: validacion });
    }

    try {
      const datos = await this.electricalAnalysisModel.getConsumo(
        id,
        { fechaInicio, fechaFinal }
      );
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener el consumo", error: error.message });
    }
  };


  getConsumoActual = async (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ message: "ID del dispositivo requerido" });
    }
  
    try {
      const datos = await this.electricalAnalysisModel.getConsumoActual(id);
      res.status(200).json(datos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener el consumo actual", error: error.message });
    }
  };

  getDispositivosPorUsuarioConsumo = async (req, res) => {
  console.log(req.params)
  const { idUsuario } = req.params;


  if (!idUsuario) {
    return res.status(400).json({ message: "El usuario no fue encontrado con dispositivos" });
  }

  try {
    const dispositivos = await getAllDeviceForUserFromDB(idUsuario);

    if (!dispositivos || dispositivos.length === 0) {
      return res.status(404).json({ message: "No se encontraron dispositivos para este usuario." });
    }

    console.log(dispositivos)
    const resultados = await Promise.all(dispositivos.map(async (dispositivo) => {
    const datosConsumo = await this.electricalAnalysisModel.getConsumoActual(dispositivo.id_sensor);
      return {
        dispositivo_id: dispositivo.id,
        dispositivo_nombre: dispositivo.dispositivo_nombre,
        consumoActual: parseFloat(datosConsumo?.consumoActualKWh?.toFixed(6) || 0),
        unidad: datosConsumo.unidad,
        costoActual: parseFloat(datosConsumo.costoPorMedicion)
      };
    }));

    return res.status(200).json(resultados);


  } catch (error) {
    console.error("Error al obtener dispositivos con el consumo:", error);
    return res.status(500).json({ message: "Error al obtener dispositivos con el consumo", error: error.message });
  }
};

  getConsumoDetalladoPorDispositivo = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "El ID del dispositivo es requerido." });
  }

  try {
    // Buscar el dispositivo para obtener el sensor_id
    const dispositivo = await getDeviceByIdFromDB(id);
    if (!dispositivo) {
      return res.status(404).json({ message: "Dispositivo no encontrado." });
    }

    const datosConsumo = await this.electricalAnalysisModel.getConsumoActual(dispositivo.id_sensor);

    return res.status(200).json({
      dispositivo_id: dispositivo.id,
      dispositivo_nombre: dispositivo.dispositivo_nombre,
      ...datosConsumo,
    });

  } catch (error) {
    console.error("Error al obtener el consumo detallado:", error);
    return res.status(500).json({
      message: "Error al obtener el consumo detallado del dispositivo.",
      error: error.message,
    });
  }
};

  getConsumoPorDispositivosYGrupos = async (req, res) => {
  const { id } = req.params;

  try {
    const datos = await this.electricalAnalysisModel.getConsumoPorDispositivosYGruposPorUsuario(id);
    res.status(200).json(datos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el consumo por dispositivos y grupos del usuario',
      error: error.message,
    });
  }
};








  

  validateParams(id, parametros) {
    // Validar que los parámetros no sean nulos o indefinidos
    if (!id) return "Ingrese el id del dispositivo";
    if (!parametros) return "Ingrese la fecha de inicio y fin";
    if (!parametros.fechaInicio) return "Ingrese la fecha de inicio";
    if (!parametros.fechaFinal) return "Ingrese la fecha de fin";

    // Validar que todos los parametros sean de tipo string
    if (typeof id !== "string")
      return "El id del dispositivo debe ser una cadena de caracteres";
    if (typeof parametros.fechaInicio !== "string")
      return "La fecha de inicio debe ser una cadena de caracteres";
    if (typeof parametros.fechaFinal !== "string")
      return "La fecha de fin debe ser una cadena de caracteres";

    // Validar que las fechas tengan el formato correcto   YYYY-MM-DD HH:MM:SS
    const validarFormatoDeFecha = (fecha) => {
      return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fecha);
    };
    if (!validarFormatoDeFecha(parametros.fechaInicio))
      return "Formato de fecha de inicio incorrecto";
    if (!validarFormatoDeFecha(parametros.fechaFinal))
      return "Formato de fecha de fin incorrecto";

    // Validar que la fecha de inicio no sea mayor a la fecha de fin y que no sean iguales
    switch (this.compararFechas(parametros.fechaInicio, parametros.fechaFinal)) {
      case 0:
        return "La fecha de inicio no puede ser igual a la fecha de fin"; // son iguales
      case 1:
        return "La fecha de inicio no puede ser mayor a la fecha de fin"; // La fecha de inicio es mayor
    }

    // Validar que la fecha de inicio y final no sean menores a la el 2 de enero de 1970 y no sean mayores a la fecha actual
    if (this.validarFechaRango(parametros.fechaInicio))
      return this.validarFechaRango(parametros.fechaInicio);
    if (this.validarFechaRango(parametros.fechaFinal))
      return this.validarFechaRango(parametros.fechaFinal);

    return true;
  }

  compararFechas(fecha1, fecha2) {
    const date1 = new Date(fecha1.replace(" ", "T"));
    const date2 = new Date(fecha2.replace(" ", "T"));

    if (isNaN(date1.getTime())) return "La fecha 1 no es válida.";
    if (isNaN(date2.getTime())) return "La fecha 2 no es válida.";

    if (date1.getTime() < date2.getTime()) {
      return -1; // fecha1 es anterior
    } else if (date1.getTime() > date2.getTime()) {
      return 1; // fecha1 es posterior
    } else {
      return 0; // son iguales
    }
  }

  validarFechaRango(fecha) {
    const objetoFecha = new Date(fecha.replace(" ", "T"));

    const fechaMinima = new Date("1970-01-02T00:00:00Z");
    const fechaActual = new Date();

    if (objetoFecha.getTime() < fechaMinima.getTime())
      return "La fecha no puede ser menor a la fecha mínima (2 de enero de 1970)";
    if (objetoFecha.getTime() > fechaActual.getTime())
      return "La fecha no puede ser mayor a la fecha actual";
  }
}
export default ElectricalAnalysisController;


  /*
  INFO ADICIONAL:
  
    Se remplaza el espacio del string de fecha por la letra T para poder convertirla a un objeto Date
  
  
    El método .getTime() de un objeto Date retorna: 
    El número de milisegundos transcurridos desde la medianoche del 1 de enero de 1970 (UTC) hasta la fecha representada.
      
  
  */
