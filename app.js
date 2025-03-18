// Importar dependencias de express
import express, { json } from 'express'
import dotenv from 'dotenv';
import groupRouter from './routes/groupRouter.js';
import deviceRouter from './routes/deviceRouter.js';
import {connectDB} from './db/connection.js';
//import cookieParser from 'cookie-parser'

// Importar middlewares
import { corsMiddleware } from './middlewares/corsMiddleware.js'
import { authMiddleware } from './middlewares/authMiddleware.js'
import { jsonErrorMiddleware } from './middlewares/jsonErrorMiddleware.js'

dotenv.config();
const port = 5051;

export const app = express()
app.use(corsMiddleware())
app.disable('x-powered-by')
app.use(express.json())
app.use(jsonErrorMiddleware)
//app.use(cookieParser())
app.use(authMiddleware)

app.use('/user', (req, res) => { return res.status(200).send({message:'Esta es la api de usuarios'})});
app.use('/device', deviceRouter);
app.use('/groups',groupRouter);


// Ruta 404
app.use((req, res) => {
  res.status(404).send({ error: 'Ruta no encontrada' })
})

connectDB();
app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})