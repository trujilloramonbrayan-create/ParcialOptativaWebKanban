export interface User {
    id: string;
    name: string;
    email: string;
    token: string;
  }
  
  export interface Project {
    _id: string;
    name: string;
    description?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Column {
    _id: string;
    name: string;
    projectId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Task {
    _id: string;
    title: string;
    description?: string;
    dueDate?: string;
    columnId: string;
    projectId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ProjectWithData {
    project: Project;
    columns: Column[];
    tasks: Task[];
  }