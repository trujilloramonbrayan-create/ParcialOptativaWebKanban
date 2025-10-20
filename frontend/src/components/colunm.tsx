import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, Task } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: Column;
  tasks: Task[];
  onCreateTask: (columnId: string, title: string, description?: string, dueDate?: string) => void;
  onUpdateTask: (taskId: string, title: string, description?: string, dueDate?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export default function ColumnComponent({
  column,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}: ColumnProps) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  
  // Estados del formulario de tarea
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onCreateTask(
      column._id,
      taskTitle,
      taskDescription || undefined,
      taskDueDate || undefined
    );

    // Limpiar formulario
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setShowTaskModal(false);
  };

  const handleUpdateColumnName = () => {
    if (columnName.trim() && columnName !== column.name) {
      onUpdateColumn(column._id, columnName);
    }
    setIsEditingName(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Header de la columna */}
      <div style={{ marginBottom: '16px' }}>
        {isEditingName ? (
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            onBlur={handleUpdateColumnName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateColumnName();
              if (e.key === 'Escape') {
                setColumnName(column.name);
                setIsEditingName(false);
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #1976d2',
              borderRadius: '4px',
              backgroundColor: 'white',
            }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                cursor: 'pointer',
              }}
              onClick={() => setIsEditingName(true)}
            >
              {column.name} ({tasks.length})
            </h3>
            <button
              onClick={() => onDeleteColumn(column._id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px',
              }}
              title="Eliminar columna"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Lista de tareas */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '12px',
          minHeight: '100px',
        }}
      >
        <SortableContext
          items={tasks.map((task) => task._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Botón agregar tarea */}
      <button
        onClick={() => setShowTaskModal(true)}
        style={{
          padding: '10px',
          backgroundColor: 'white',
          border: '2px dashed #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500',
        }}
      >
        + Agregar tarea
      </button>

      {/* Modal crear tarea */}
      {showTaskModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTaskModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              width: '480px',
              maxWidth: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Nueva Tarea</h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Título de la tarea"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Descripción
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Descripción opcional"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setTaskTitle('');
                    setTaskDescription('');
                    setTaskDueDate('');
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}