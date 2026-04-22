export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived'
export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type ViewMode = 'table' | 'kanban'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: Priority
  deadline: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assignee: string
  dueDate: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ProjectFilters {
  search: string
  status: ProjectStatus | ''
  priority: Priority | ''
}

export interface TaskFilters {
  search: string
  status: TaskStatus | ''
  priority: Priority | ''
  assignee: string
}

export interface ProjectStats {
  total: number
  active: number
  completed: number
  onHold: number
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  done: number
}

export type CreateProjectDto = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProjectDto = Partial<CreateProjectDto>
export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>
export type UpdateTaskDto = Partial<CreateTaskDto>
