import { Request, Response } from 'express';
import Column from '../models/Column';
import Project from '../models/Project';
import Task from '../models/Task';

// Crear columna
export const createColumn = async (req: Request, res: Response) => {
  try {
    const { name, projectId } = req.body;

    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para crear columnas en este proyecto'
      });
    }

    // Obtener el siguiente número de orden
    const lastColumn = await Column.findOne({ projectId })
      .sort({ order: -1 })
      .limit(1);
    
    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = await Column.create({
      name,
      projectId,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Columna creada exitosamente',
      data: column
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la columna',
      error: error.message
    });
  }
};

// Obtener columnas de un proyecto
export const getColumnsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este proyecto'
      });
    }

    const columns = await Column.find({ projectId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: columns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las columnas',
      error: error.message
    });
  }
};

// Actualizar columna
export const updateColumn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const column = await Column.findById(id);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Columna no encontrada'
      });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findById(column.projectId);
    if (!project || project.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta columna'
      });
    }

    column.name = name;
    await column.save();

    res.status(200).json({
      success: true,
      message: 'Columna actualizada exitosamente',
      data: column
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la columna',
      error: error.message
    });
  }
};

// Eliminar columna
export const deleteColumn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const column = await Column.findById(id);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Columna no encontrada'
      });
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await Project.findById(column.projectId);
    if (!project || project.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta columna'
      });
    }

    // El middleware del modelo se encargará de eliminar las tareas
    await Column.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Columna eliminada exitosamente'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la columna',
      error: error.message
    });
  }
};

// Reordenar columnas
export const reorderColumns = async (req: Request, res: Response) => {
  try {
    const { projectId, columns } = req.body;
    // columns debe ser un array de { id, order }

    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para reordenar columnas en este proyecto'
      });
    }

    // Actualizar el orden de cada columna
    const updatePromises = columns.map((col: { id: string; order: number }) =>
      Column.findByIdAndUpdate(col.id, { order: col.order }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedColumns = await Column.find({ projectId }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Columnas reordenadas exitosamente',
      data: updatedColumns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al reordenar las columnas',
      error: error.message
    });
  }
};