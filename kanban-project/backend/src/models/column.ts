import mongoose, { Document, Schema } from 'mongoose';

export interface IColumn extends Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IColumn>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

columnSchema.index({ projectId: 1, order: 1 });

export default mongoose.model<IColumn>('Column', columnSchema);