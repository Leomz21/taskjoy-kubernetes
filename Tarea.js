const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
    titulo:      { type: String, required: true },
    estado:      { type: String, enum: ['Pendiente', 'Completada'], default: 'Pendiente' },
    prioridad:   { type: String, enum: ['Alta', 'Media', 'Baja'],   default: 'Media' },
    categoria:   { type: String, default: '' },
    fechaLimite: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Tarea', tareaSchema);