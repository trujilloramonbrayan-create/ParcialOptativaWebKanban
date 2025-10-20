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

    // Verificar que la columna existe y pertenece al proyecto
    const column = await Column.findOne({ _id: columnId, projectId });
    if (!column) {
      return res.status(404).json({ success: false, message: 'Columna no encontrada' });
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al crear tarea', error: error.message });
  }
};

// Obtener todas las tareas de un proyecto
export const getTasksByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    const tasks = await Task.find({ projectId }).sort({ order: 1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener tareas', error: error.message });
  }
};

// Obtener tareas de una columna específica
export const getTasksByColumn = async (req: AuthRequest, res: Response) => {
  try {
    const { columnId } = req.params;

    // Verificar que la columna existe
    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ success: false, message: 'Columna no encontrada' });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findOne({ _id: column.projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const tasks = await Task.find({ columnId }).sort({ order: 1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener tareas', error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al actualizar tarea', error: error.message });
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

    // Verificar que la columna existe y pertenece al mismo proyecto
    const column = await Column.findOne({ _id: columnId, projectId: task.projectId });
    if (!column) {
      return res.status(404).json({ success: false, message: 'Columna no encontrada' });
    }

    task.columnId = columnId;
    task.order = order;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al mover tarea', error: error.message });
  }
};

// Reordenar tareas dentro de una columna
export const reorderTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { tasks } = req.body;
    // tasks debe ser un array de { id, order }

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere un array de tareas' 
      });
    }

    // Verificar que todas las tareas existen y el usuario tiene permiso
    const taskIds = tasks.map((t: { id: string; order: number }) => t.id);
    const dbTasks = await Task.find({ _id: { $in: taskIds } });

    if (dbTasks.length !== tasks.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Una o más tareas no encontradas' 
      });
    }

    // Verificar que el proyecto pertenece al usuario
    const projectId = dbTasks[0].projectId;
    const project = await Project.findOne({ _id: projectId, userId: req.userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    // Actualizar el orden de cada tarea
    const updatePromises = tasks.map((t: { id: string; order: number }) =>
      Task.findByIdAndUpdate(t.id, { order: t.order }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedTasks = await Task.find({ _id: { $in: taskIds } }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Tareas reordenadas exitosamente',
      data: updatedTasks
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al reordenar tareas', 
      error: error.message 
    });
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
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar tarea', 
      error: error.message 
    });
  }
};