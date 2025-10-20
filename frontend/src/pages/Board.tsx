import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, Task, Project } from '../types';
import * as api from '../services/api';
import ColumnComponent from '../components/Column';
import TaskCard from '../components/TaskCard';

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Estados principales
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para drag & drop
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Estados de modales
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Configuración del sensor de drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Cargar datos iniciales
  useEffect(() => {
    if (projectId) {
      loadBoardData();
    }
  }, [projectId]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      const [projectRes, columnsRes, tasksRes] = await Promise.all([
        api.getProject(projectId!),
        api.getColumns(projectId!),
        api.getTasks(projectId!),
      ]);

      setProject(projectRes.data.data);
      setColumns(columnsRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error('Error al cargar el tablero:', error);
      alert('Error al cargar el tablero');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COLUMNAS ====================
  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    try {
      await api.createColumn(newColumnName, projectId!);
      setNewColumnName('');
      setShowColumnModal(false);
      loadBoardData();
    } catch (error) {
      console.error('Error al crear columna:', error);
      alert('Error al crear columna');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!window.confirm('¿Eliminar esta columna y todas sus tareas?')) return;

    try {
      await api.deleteColumn(columnId);
      loadBoardData();
    } catch (error) {
      console.error('Error al eliminar columna:', error);
      alert('Error al eliminar columna');
    }
  };

  const handleUpdateColumn = async (columnId: string, newName: string) => {
    try {
      await api.updateColumn(columnId, newName);
      loadBoardData();
    } catch (error) {
      console.error('Error al actualizar columna:', error);
      alert('Error al actualizar columna');
    }
  };

  // ==================== TAREAS ====================
  const handleCreateTask = async (columnId: string, title: string, description?: string, dueDate?: string) => {
    try {
      await api.createTask(title, columnId, projectId!, description, dueDate);
      loadBoardData();
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear tarea');
    }
  };

  const handleUpdateTask = async (taskId: string, title: string, description?: string, dueDate?: string) => {
    try {
      await api.updateTask(taskId, title, description, dueDate);
      loadBoardData();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar tarea');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;

    try {
      await api.deleteTask(taskId);
      loadBoardData();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar tarea');
    }
  };

  // ==================== DRAG & DROP ====================
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Encontrar la tarea que se está moviendo
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // Determinar la columna de destino
    let targetColumnId: string;
    const overColumn = columns.find((col) => col._id === overId);
    const overTask = tasks.find((t) => t._id === overId);

    if (overColumn) {
      targetColumnId = overColumn._id;
    } else if (overTask) {
      targetColumnId = overTask.columnId;
    } else {
      return;
    }

    // Si no cambió de columna, no hacer nada
    if (task.columnId === targetColumnId) return;

    // Obtener tareas de la columna de destino
    const targetTasks = tasks.filter((t) => t.columnId === targetColumnId);
    const newOrder = targetTasks.length;

    try {
      await api.moveTask(taskId, targetColumnId, newOrder);
      loadBoardData();
    } catch (error) {
      console.error('Error al mover tarea:', error);
      alert('Error al mover tarea');
    }
  };

  // Obtener tareas por columna
  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((task) => task.columnId === columnId).sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p style={{ fontSize: '18px' }}>Cargando tablero...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <button
            onClick={() => navigate('/projects')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          >
            ← Volver a Proyectos
          </button>
          <h1 style={{ margin: '0', fontSize: '28px' }}>{project?.name}</h1>
          {project?.description && (
            <p style={{ color: '#666', marginTop: '8px' }}>{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowColumnModal(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
          }}
        >
          + Nueva Columna
        </button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          paddingBottom: '20px'
        }}>
          <SortableContext
            items={columns.map((col) => col._id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <ColumnComponent
                key={column._id}
                column={column}
                tasks={getTasksByColumn(column._id)}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onUpdateColumn={handleUpdateColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modal Nueva Columna */}
      {showColumnModal && (
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
            zIndex: 1000
          }}
          onClick={() => setShowColumnModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '12px',
              width: '400px',
              maxWidth: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Nueva Columna</h2>
            <form onSubmit={handleCreateColumn}>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Nombre de la columna"
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowColumnModal(false);
                    setNewColumnName('');
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
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
                    cursor: 'pointer'
                  }}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}