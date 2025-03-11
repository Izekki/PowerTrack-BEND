const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//Importar Rutas

//Usar las rutas importadas

//Ruta default
app.use((req, res) => {
    res.status(404).send({ error: 'Ruta no encontrada' })
})


app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`)
})