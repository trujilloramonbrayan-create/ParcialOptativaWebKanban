import React from 'react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, title: string, description?: string, dueDate?: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        {task.title}
      </h4>
      {task.description && (
        <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#6b7280' }}>{task.description}</p>
      )}
      {task.dueDate && (
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>
          Fecha de vencimiento: {task.dueDate}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => onUpdate(task._id, task.title, task.description, task.dueDate)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(task._id)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;