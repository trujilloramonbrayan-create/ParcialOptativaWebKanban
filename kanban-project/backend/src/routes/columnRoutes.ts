import express from 'express';
import { createColumn, updateColumn, deleteColumn } from '../controllers/columnController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createColumn);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);

export default router;