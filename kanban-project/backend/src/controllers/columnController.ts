import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Column from '../models/Column';
import Task from '../models/Task';
import Project from '../models/Project';

// Crear columna
export const createColumn = async (req: AuthRequest, res: Response) => {
  try {
    const { name, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ success: false, message: 'Nombre y projectId requeridos' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    // Obtener el último order
    const lastColumn = await Column.findOne({ projectId }).sort({ order: -1 });
    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = await Column.create({ name, projectId, order });

    res.status(201).json({ success: true, data: column });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear columna' });
  }
};

// Actualizar columna
export const updateColumn = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ success: false, message: 'Columna no encontrada' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: column.projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    column.name = name || column.name;
    await column.save();

    res.status(200).json({ success: true, data: column });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar columna' });
  }
};

// Eliminar columna
export const deleteColumn = async (req: AuthRequest, res: Response) => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ success: false, message: 'Columna no encontrada' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: column.projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    // Eliminar tareas asociadas
    await Task.deleteMany({ columnId: req.params.id });
    await Column.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Columna eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar columna' });
  }
};