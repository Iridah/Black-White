const express = require('express');
const jimp = require('jimp/es');
const { v4: uuidv4 } = require('uuid');
const nodemon = require('nodemon');

const app = express();

// Configuración de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Para procesar formularios
app.use(express.static('public'));

// Configuración de Bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// Rutas
app.use('/', require('./routes/index'));
app.use('/process-image', require('./routes/process-image'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

// Inicio del servidor
app.listen(3000, () => {
  console.log('Servidor procesando puerto 3000');
});

// Configuración de Nodemon (opcional)
nodemon.on('start', () => {
  console.log('Nodemon iniciado');
});
nodemon.on('watch', () => {
  console.log('Cambios detectados, reiniciando servidor...');
});
