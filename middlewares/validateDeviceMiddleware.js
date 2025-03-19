/*export const validateDevice = (req, res, next) => {
    const { name, status } = req.body;
    if (!name || !status) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    next();
  };

  export const validateDevice = (req, res, next) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    next();
};*/
export const validateDevice = (req, res, next) => {
  const { nombre, ubicacion, usuario_id, id_grupo } = req.body;

  if (!nombre || !ubicacion || !usuario_id ) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (typeof usuario_id !== 'number' || (id_grupo !== null && typeof id_grupo !== 'number')) {
    return res.status(400).json({ message: 'usuario_id e id_grupo deben ser números o id_grupo puede ser null' });
  }  

  next();
};


  