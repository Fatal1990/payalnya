import api from './axios'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types'

export const tasksApi = {
  getAll(projectId?: string): Promise<Task[]> {
    return api.get<Task[]>('/tasks', { params: projectId ? { projectId } : undefined }).then(r => r.data)
  },
  getById(id: string): Promise<Task> {
    return api.get<Task>(`/tasks/${id}`).then(r => r.data)
  },
  create(dto: CreateTaskDto): Promise<Task> {
    return api.post<Task>('/tasks', dto).then(r => r.data)
  },
  update(id: string, dto: UpdateTaskDto): Promise<Task> {
    return api.put<Task>(`/tasks/${id}`, dto).then(r => r.data)
  },
  remove(id: string): Promise<void> {
    return api.delete(`/tasks/${id}`).then(() => undefined)
  },
  reorder(projectId: string, orderedIds: string[]): Promise<void> {
    return api.post('/tasks/reorder', { projectId, orderedIds }).then(() => undefined)
  }
}
