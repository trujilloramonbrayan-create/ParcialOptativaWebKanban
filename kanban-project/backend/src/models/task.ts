import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  columnId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'El título de la tarea es requerido'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
      default: ''
    },
    dueDate: {
      type: Date,
      default: null
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: [true, 'El ID de la columna es requerido'],
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'El ID del proyecto es requerido'],
      index: true
    },
    order: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El orden no puede ser negativo']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices compuestos para optimizar consultas
taskSchema.index({ projectId: 1, columnId: 1, order: 1 });
taskSchema.index({ dueDate: 1 });

// Virtual para verificar si la tarea está vencida
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Asegurar que los virtuals se incluyan en JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;