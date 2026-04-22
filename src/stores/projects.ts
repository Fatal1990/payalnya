import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsApi } from '@/api/projects'
import { useUiStore } from './ui'
import type { Project, ProjectFilters, CreateProjectDto, UpdateProjectDto } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const ui = useUiStore()
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const filters = ref<ProjectFilters>({ search: '', status: '', priority: '' })

  const filteredProjects = computed(() => {
    let list = projects.value
    const { search, status, priority } = filters.value
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (status) list = list.filter(p => p.status === status)
    if (priority) list = list.filter(p => p.priority === priority)
    return list
  })

  const stats = computed(() => ({
    total: projects.value.length,
    active: projects.value.filter(p => p.status === 'active').length,
    completed: projects.value.filter(p => p.status === 'completed').length,
    onHold: projects.value.filter(p => p.status === 'on-hold').length
  }))

  async function fetchProjects() {
    loading.value = true
    try {
      projects.value = await projectsApi.getAll()
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to load projects')
    } finally {
      loading.value = false
    }
  }

  async function createProject(dto: CreateProjectDto) {
    loading.value = true
    try {
      const project = await projectsApi.create(dto)
      projects.value.push(project)
      ui.notify('success', `Project "${project.name}" created!`)
      return project
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to create project')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id: string, dto: UpdateProjectDto) {
    loading.value = true
    try {
      const updated = await projectsApi.update(id, dto)
      const idx = projects.value.findIndex(p => p.id === id)
      if (idx !== -1) projects.value[idx] = updated
      ui.notify('success', `Project "${updated.name}" updated!`)
      return updated
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to update project')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id: string) {
    loading.value = true
    try {
      await projectsApi.remove(id)
      const idx = projects.value.findIndex(p => p.id === id)
      const name = projects.value[idx]?.name
      if (idx !== -1) projects.value.splice(idx, 1)
      ui.notify('success', `Project "${name}" deleted`)
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to delete project')
    } finally {
      loading.value = false
    }
  }

  function setFilters(f: Partial<ProjectFilters>) {
    filters.value = { ...filters.value, ...f }
  }

  function getById(id: string) {
    return projects.value.find(p => p.id === id)
  }

  return { projects, filteredProjects, loading, filters, stats, fetchProjects, createProject, updateProject, deleteProject, setFilters, getById }
})
