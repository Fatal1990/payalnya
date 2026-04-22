import api from './axios'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types'

export const projectsApi = {
  getAll(): Promise<Project[]> {
    return api.get<Project[]>('/projects').then(r => r.data)
  },
  getById(id: string): Promise<Project> {
    return api.get<Project>(`/projects/${id}`).then(r => r.data)
  },
  create(dto: CreateProjectDto): Promise<Project> {
    return api.post<Project>('/projects', dto).then(r => r.data)
  },
  update(id: string, dto: UpdateProjectDto): Promise<Project> {
    return api.put<Project>(`/projects/${id}`, dto).then(r => r.data)
  },
  remove(id: string): Promise<void> {
    return api.delete(`/projects/${id}`).then(() => undefined)
  }
}
