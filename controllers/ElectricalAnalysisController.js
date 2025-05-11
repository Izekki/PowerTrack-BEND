import ElectricalAnalysisModel from "../models/ElectricalAnalysisModel.js";

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
