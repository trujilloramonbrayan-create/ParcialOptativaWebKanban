import express from 'express';
import { 
  createTask, 
  getTasksByProject,
  getTasksByColumn,
  updateTask, 
  moveTask, 
  reorderTasks,
  deleteTask 
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// POST /api/tasks - Crear tarea
router.post('/', createTask);

// GET /api/tasks/project/:projectId - Obtener todas las tareas de un proyecto
router.get('/project/:projectId', getTasksByProject);

// GET /api/tasks/column/:columnId - Obtener tareas de una columna
router.get('/column/:columnId', getTasksByColumn);

// PUT /api/tasks/reorder - Reordenar tareas (ANTES de /:id para evitar conflictos)
router.put('/reorder', reorderTasks);

// PUT /api/tasks/:id/move - Mover tarea a otra columna (Drag & Drop)
router.put('/:id/move', moveTask);

// PUT /api/tasks/:id - Actualizar tarea
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Eliminar tarea
router.delete('/:id', deleteTask);

export default router;