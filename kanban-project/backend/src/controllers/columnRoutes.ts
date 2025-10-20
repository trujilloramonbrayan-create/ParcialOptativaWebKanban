import express from 'express';
import {
  createColumn,
  getColumnsByProject,
  updateColumn,
  deleteColumn,
  reorderColumns
} from './columnController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// POST /api/columns - Crear columna
router.post('/', createColumn);

// GET /api/columns/project/:projectId - Obtener columnas de un proyecto
router.get('/project/:projectId', getColumnsByProject);

// PUT /api/columns/reorder - Reordenar columnas (ANTES de /:id para evitar conflictos)
router.put('/reorder', reorderColumns);

// PUT /api/columns/:id - Actualizar columna
router.put('/:id', updateColumn);

// DELETE /api/columns/:id - Eliminar columna
router.delete('/:id', deleteColumn);

export default router;