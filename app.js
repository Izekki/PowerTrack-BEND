// Importar dependencias de express
import express from 'express';
import dotenv from 'dotenv';
import { json } from 'express';
import helmet from 'helmet';

// Importar conexión a la base de datos
import { connectDB } from './db/connection.js';

// Importar middlewares
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import { jsonErrorMiddleware } from './middlewares/jsonErrorMiddleware.js';

// Importar routers
import groupRouter from './routes/groupRouter.js';
import deviceRouter from './routes/deviceRouter.js';
import loginRouter from './routes/loginRouter.js';
import userRouter from './routes/UserRouter.js';
import supplierRouter from './routes/supplierRouter.js'
import passwordRecoveryRouter from './routes/passwordRecoveryRouter.js';
import sensorRouter from './routes/sensorRouter.js';
//import cookieParser from 'cookie-parser'

// Configuración inicial
dotenv.config();
const port = 5051;

// Inicializar aplicación express
export const app = express();

// Configuración de middlewares
app.disable('x-powered-by');
app.use(helmet());
app.use(corsMiddleware());
app.use(express.json());
app.use(jsonErrorMiddleware);
//app.use(cookieParser());
//app.use(authenticate);

// Configuración de rutas
app.use('/user', userRouter);
app.use('/login', loginRouter);
app.use('/device' ,deviceRouter);
app.use('/groups' ,groupRouter);
app.use('/supplier',supplierRouter);
app.use('/psR',passwordRecoveryRouter);
app.use('/sensor',sensorRouter);


// Ruta 404
app.use((req, res) => {
  res.status(404).send({ error: 'Ruta no encontrada' });
});

// Conectar a la base de datos e iniciar servidor
connectDB();
app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});