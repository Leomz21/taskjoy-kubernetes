const express = require('express');
const Tarea = require('./Tarea');
const router = express.Router();

// Listar todas las tareas
router.get('/', async (req, res) => {
    try {
        const tareas = await Tarea.find().sort({ createdAt: -1 });
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron obtener las tareas' });
    }
});

// Crear una tarea
router.post('/', async (req, res) => {
    try {
        const { titulo, estado, prioridad, categoria, fechaLimite } = req.body;
        if (!titulo || !titulo.trim()) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }
        const tarea = await Tarea.create({ titulo, estado, prioridad, categoria, fechaLimite });
        res.status(201).json(tarea);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo crear la tarea' });
    }
});

// Editar una tarea
router.put('/:id', async (req, res) => {
    try {
        const { titulo, estado, prioridad, categoria, fechaLimite } = req.body;
        const tarea = await Tarea.findByIdAndUpdate(
            req.params.id,
            { titulo, estado, prioridad, categoria, fechaLimite },
            { new: true, runValidators: true }
        );
        if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.json(tarea);
    } catch (error) {
        res.status(400).json({ error: 'No se pudo actualizar la tarea' });
    }
});

// Eliminar una tarea
router.delete('/:id', async (req, res) => {
    try {
        const tarea = await Tarea.findByIdAndDelete(req.params.id);
        if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ error: 'No se pudo eliminar la tarea' });
    }
});

module.exports = router;