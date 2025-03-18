/*export const validateDevice = (req, res, next) => {
    const { name, status } = req.body;
    if (!name || !status) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    next();
  };*/

  export const validateDevice = (req, res, next) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    next();
};

  