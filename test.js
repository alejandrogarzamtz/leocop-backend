// backend/test.js
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.send('Hola mundo');
});

app.listen(1234, () => {
  console.log('Servidor de prueba corriendo en http://localhost:1234');
});
