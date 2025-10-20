import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// Projects
export const getProjects = () => api.get('/projects');
export const getProject = (id: string) => api.get(`/projects/${id}`);
export const createProject = (name: string, description?: string) =>
  api.post('/projects', { name, description });
export const updateProject = (id: string, name: string, description?: string) =>
  api.put(`/projects/${id}`, { name, description });
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);

// Columns
export const createColumn = (name: string, projectId: string) =>
  api.post('/columns', { name, projectId });
export const updateColumn = (id: string, name: string) =>
  api.put(`/columns/${id}`, { name });
export const deleteColumn = (id: string) => api.delete(`/columns/${id}`);

// Tasks
export const createTask = (
  title: string,
  columnId: string,
  projectId: string,
  description?: string,
  dueDate?: string
) => api.post('/tasks', { title, description, dueDate, columnId, projectId });

export const updateTask = (
  id: string,
  title?: string,
  description?: string,
  dueDate?: string
) => api.put(`/tasks/${id}`, { title, description, dueDate });

export const moveTask = (id: string, columnId: string, order: number) =>
  api.put(`/tasks/${id}/move`, { columnId, order });

export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);