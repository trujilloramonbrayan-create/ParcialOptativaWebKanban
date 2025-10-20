import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Task from '../models/Task';
import Project from '../models/Project';
import Column from '../models/Column';

// Crear tarea
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate, columnId, projectId } = req.body;

    if (!title || !columnId || !projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Título, columnId y projectId requeridos' 
      });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    // Obtener el último order
    const lastTask = await Task.findOne({ columnId }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      dueDate,
      columnId,
      projectId,
      order
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear tarea' });
  }
};

// Actualizar tarea
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: task.projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar tarea' });
  }
};

// Mover tarea (Drag & Drop)
export const moveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { columnId, order } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: task.projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    // Verificar que la columna existe
    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ success: false, message: 'Columna no encontrada' });
    }

    task.columnId = columnId;
    task.order = order;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al mover tarea' });
  }
};

// Eliminar tarea
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: task.projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar tarea' });
  }
};