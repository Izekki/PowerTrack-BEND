// Importar dependencias de express
import express, { json } from 'express'
import dotenv from 'dotenv';
//import cookieParser from 'cookie-parser'

// Importar middlewares
import { corsMiddleware } from './middlewares/corsMiddleware.js'
import { authMiddleware } from './middlewares/authMiddleware.js'
import { jsonErrorMiddleware } from './middlewares/jsonErrorMiddleware.js'

dotenv.config();
const port = process.env.SERVER_PORT || 2000;

export const app = express()
app.use(corsMiddleware())
app.disable('x-powered-by')
app.use(json())
app.use(jsonErrorMiddleware)
//app.use(cookieParser())
app.use(authMiddleware)

app.use('/user', (req, res) => { return res.status(200).send({message:'Esta es la api de usuarios'})});
app.use('/device', (req, res) => { return res.status(200).send({message:'Esta es la api de dispositivos'})});

app.use((req, res) => {
    res.status(404).send({ error: 'Ruta no encontrada' })
})

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})