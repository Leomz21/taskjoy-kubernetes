const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tareas', require('./tareas'));

// Ruta de salud, útil para probar la conexión desde la otra máquina
app.get('/api/salud', (req, res) => {
    res.json({ estado: 'ok', pod: process.env.HOSTNAME });
});

const PUERTO      = process.env.PORT        || 3000;
const MONGO_HOST  = process.env.MONGO_HOST  || 'localhost';
const MONGO_PORT  = process.env.MONGO_PORT  || '27017';
const MONGO_DB    = process.env.MONGO_DB    || 'tareasdb';
const MONGO_USER  = process.env.MONGO_USER;
const MONGO_PASS  = process.env.MONGO_PASSWORD;

const credenciales = MONGO_USER ? `${MONGO_USER}:${encodeURIComponent(MONGO_PASS)}@` : '';
const authSource   = MONGO_USER ? '?authSource=admin' : '';
const URI = `mongodb://${credenciales}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}${authSource}`;

mongoose.connect(URI)
    .then(() => {
        console.log(`Conectado a MongoDB en ${MONGO_HOST}:${MONGO_PORT}`);
        app.listen(PUERTO, () => console.log(`API escuchando en el puerto ${PUERTO}`));
    })
    .catch(error => {
        console.error('Error al conectar con MongoDB:', error.message);
        process.exit(1);
    });