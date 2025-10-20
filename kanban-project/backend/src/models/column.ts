import mongoose, { Document, Schema } from 'mongoose';

export interface IColumn extends Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IColumn>(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la columna es requerido'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres']
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

// Índice compuesto para mejorar consultas
columnSchema.index({ projectId: 1, order: 1 });

// Middleware para eliminar tareas asociadas al eliminar una columna
columnSchema.pre('findOneAndDelete', async function(next) {
  try {
    const columnId = this.getQuery()._id;
    await mongoose.model('Task').deleteMany({ columnId });
    next();
  } catch (error: any) {
    next(error);
  }
});

const Column = mongoose.model<IColumn>('Column', columnSchema);

export default Column;