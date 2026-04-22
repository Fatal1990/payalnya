import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tasksApi } from '@/api/tasks'
import { useUiStore } from './ui'
import type { Task, TaskFilters, TaskStatus, CreateTaskDto, UpdateTaskDto } from '@/types'

export const useTasksStore = defineStore('tasks', () => {
  const ui = useUiStore()
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const filters = ref<TaskFilters>({ search: '', status: '', priority: '', assignee: '' })

  const filteredTasks = computed(() => {
    let list = tasks.value
    const { search, status, priority, assignee } = filters.value
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    if (status) list = list.filter(t => t.status === status)
    if (priority) list = list.filter(t => t.priority === priority)
    if (assignee) list = list.filter(t => t.assignee.toLowerCase().includes(assignee.toLowerCase()))
    return list
  })

  const tasksByStatus = computed(() => {
    const fl = filteredTasks.value
    return {
      todo: fl.filter(t => t.status === 'todo').sort((a, b) => a.order - b.order),
      'in-progress': fl.filter(t => t.status === 'in-progress').sort((a, b) => a.order - b.order),
      done: fl.filter(t => t.status === 'done').sort((a, b) => a.order - b.order)
    }
  })

  const stats = computed(() => ({
    total: tasks.value.length,
    todo: tasks.value.filter(t => t.status === 'todo').length,
    inProgress: tasks.value.filter(t => t.status === 'in-progress').length,
    done: tasks.value.filter(t => t.status === 'done').length
  }))

  const assignees = computed(() => {
    const set = new Set(tasks.value.map(t => t.assignee).filter(Boolean))
    return Array.from(set)
  })

  async function fetchTasks(projectId?: string) {
    loading.value = true
    try {
      tasks.value = await tasksApi.getAll(projectId)
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to load tasks')
    } finally {
      loading.value = false
    }
  }

  async function createTask(dto: CreateTaskDto) {
    loading.value = true
    try {
      const task = await tasksApi.create(dto)
      tasks.value.push(task)
      ui.notify('success', `Task "${task.title}" created!`)
      return task
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to create task')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: string, dto: UpdateTaskDto) {
    loading.value = true
    try {
      const updated = await tasksApi.update(id, dto)
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = updated
      ui.notify('success', `Task "${updated.title}" updated!`)
      return updated
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to update task')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string) {
    loading.value = true
    try {
      await tasksApi.remove(id)
      const idx = tasks.value.findIndex(t => t.id === id)
      const title = tasks.value[idx]?.title
      if (idx !== -1) tasks.value.splice(idx, 1)
      ui.notify('success', `Task "${title}" deleted`)
    } catch (e: unknown) {
      ui.notify('error', (e as Error).message || 'Failed to delete task')
    } finally {
      loading.value = false
    }
  }

  async function moveTask(taskId: string, newStatus: TaskStatus) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return
    const idx = tasks.value.findIndex(t => t.id === taskId)
    tasks.value[idx] = { ...task, status: newStatus }
    try {
      await tasksApi.update(taskId, { status: newStatus })
    } catch (e: unknown) {
      tasks.value[idx] = task
      ui.notify('error', 'Failed to move task')
    }
  }

  async function reorderTasks(projectId: string, newOrder: Task[]) {
    const updated = newOrder.map((t, i) => ({ ...t, order: i }))
    updated.forEach(t => {
      const idx = tasks.value.findIndex(x => x.id === t.id)
      if (idx !== -1) tasks.value[idx] = t
    })
    try {
      await tasksApi.reorder(projectId, updated.map(t => t.id))
    } catch (e: unknown) {
      ui.notify('error', 'Failed to reorder tasks')
    }
  }

  function setFilters(f: Partial<TaskFilters>) {
    filters.value = { ...filters.value, ...f }
  }

  function clearTasks() {
    tasks.value = []
  }

  return { tasks, filteredTasks, tasksByStatus, loading, filters, stats, assignees, fetchTasks, createTask, updateTask, deleteTask, moveTask, reorderTasks, setFilters, clearTasks }
})
