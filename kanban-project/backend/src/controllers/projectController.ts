import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Project from '../models/Project';
import Column from '../models/Column';
import Task from '../models/Task';

// Obtener todos los proyectos del usuario
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener proyectos' });
  }
};

// Obtener un proyecto por ID
export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    const columns = await Column.find({ projectId: project._id }).sort({ order: 1 });
    const tasks = await Task.find({ projectId: project._id }).sort({ order: 1 });

    res.status(200).json({ 
      success: true, 
      data: { project, columns, tasks } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener proyecto' });
  }
};

// Crear proyecto
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    const project = await Project.create({
      name,
      description,
      userId: req.userId
    });

    // Crear columnas por defecto
    const defaultColumns = ['Por hacer', 'En progreso', 'Hecho'];
    const columns = await Column.insertMany(
      defaultColumns.map((name, index) => ({
        name,
        projectId: project._id,
        order: index
      }))
    );

    res.status(201).json({ success: true, data: { project, columns } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear proyecto' });
  }
};

// Actualizar proyecto
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar proyecto' });
  }
};

// Eliminar proyecto
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    // Eliminar columnas y tareas asociadas
    await Column.deleteMany({ projectId: req.params.id });
    await Task.deleteMany({ projectId: req.params.id });

    res.status(200).json({ success: true, message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar proyecto' });
  }
};