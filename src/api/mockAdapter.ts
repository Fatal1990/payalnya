import MockAdapter from 'axios-mock-adapter'
import api from './axios'
import type { Project, Task } from '@/types'

const PROJECTS_KEY = 'pm_projects'
const TASKS_KEY = 'pm_tasks'

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1', name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    status: 'active', priority: 'high', deadline: '2024-06-30',
    createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: '2', name: 'Mobile App MVP',
    description: 'Build minimum viable product for the mobile application',
    status: 'active', priority: 'high', deadline: '2024-05-15',
    createdAt: '2024-01-20T09:00:00.000Z', updatedAt: '2024-01-20T09:00:00.000Z'
  },
  {
    id: '3', name: 'API Integration',
    description: 'Integrate third-party payment and analytics APIs',
    status: 'on-hold', priority: 'medium', deadline: '2024-07-01',
    createdAt: '2024-02-01T11:00:00.000Z', updatedAt: '2024-02-01T11:00:00.000Z'
  },
  {
    id: '4', name: 'Database Migration',
    description: 'Migrate legacy database to new PostgreSQL cluster',
    status: 'completed', priority: 'critical', deadline: '2024-03-31',
    createdAt: '2024-01-10T08:00:00.000Z', updatedAt: '2024-03-31T17:00:00.000Z'
  }
]

const DEFAULT_TASKS: Task[] = [
  { id: 't1', projectId: '1', title: 'Design mockups', description: 'Create Figma mockups for all key pages', status: 'done', priority: 'high', assignee: 'Anna Shevchenko', dueDate: '2024-02-15', order: 0, createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-02-15T10:00:00.000Z' },
  { id: 't2', projectId: '1', title: 'Frontend development', description: 'Implement Vue.js components based on approved designs', status: 'in-progress', priority: 'high', assignee: 'Mykola Kovalenko', dueDate: '2024-04-30', order: 1, createdAt: '2024-02-16T09:00:00.000Z', updatedAt: '2024-02-16T09:00:00.000Z' },
  { id: 't3', projectId: '1', title: 'SEO optimization', description: 'Implement meta tags, sitemap, and structured data', status: 'todo', priority: 'medium', assignee: 'Olena Petrenko', dueDate: '2024-05-31', order: 2, createdAt: '2024-02-20T10:00:00.000Z', updatedAt: '2024-02-20T10:00:00.000Z' },
  { id: 't4', projectId: '2', title: 'UI/UX Design', description: 'Design mobile app screens and user flows', status: 'done', priority: 'high', assignee: 'Anna Shevchenko', dueDate: '2024-02-28', order: 0, createdAt: '2024-01-20T09:00:00.000Z', updatedAt: '2024-02-28T10:00:00.000Z' },
  { id: 't5', projectId: '2', title: 'React Native setup', description: 'Initialize project, configure navigation and state management', status: 'in-progress', priority: 'high', assignee: 'Ivan Bondarenko', dueDate: '2024-03-31', order: 1, createdAt: '2024-03-01T09:00:00.000Z', updatedAt: '2024-03-01T09:00:00.000Z' },
  { id: 't6', projectId: '2', title: 'Push notifications', description: 'Integrate Firebase push notifications', status: 'todo', priority: 'medium', assignee: 'Ivan Bondarenko', dueDate: '2024-04-30', order: 2, createdAt: '2024-03-05T10:00:00.000Z', updatedAt: '2024-03-05T10:00:00.000Z' },
  { id: 't7', projectId: '3', title: 'Payment gateway research', description: 'Evaluate Stripe, LiqPay and Monobank options', status: 'done', priority: 'high', assignee: 'Dmytro Lysenko', dueDate: '2024-02-28', order: 0, createdAt: '2024-02-01T11:00:00.000Z', updatedAt: '2024-02-28T10:00:00.000Z' },
  { id: 't8', projectId: '3', title: 'Stripe integration', description: 'Implement Stripe payment processing', status: 'todo', priority: 'high', assignee: 'Mykola Kovalenko', dueDate: '2024-05-15', order: 1, createdAt: '2024-03-01T10:00:00.000Z', updatedAt: '2024-03-01T10:00:00.000Z' }
]

function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    const d = raw ? JSON.parse(raw) : null; return (d && d.length) ? d : DEFAULT_PROJECTS
  } catch { return DEFAULT_PROJECTS }
}

function saveProjets(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

function getTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    const d = raw ? JSON.parse(raw) : null; return (d && d.length) ? d : DEFAULT_TASKS
  } catch { return DEFAULT_TASKS }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function setupMockAdapter() {
  const mock = new MockAdapter(api, { delayResponse: 200 })

  if (!localStorage.getItem(PROJECTS_KEY)) saveProjets(DEFAULT_PROJECTS)
  if (!localStorage.getItem(TASKS_KEY)) saveTasks(DEFAULT_TASKS)

  mock.onGet('/projects').reply(() => {
    return [200, getProjects()]
  })

  mock.onGet(/\/projects\/(\w+)$/).reply((config) => {
    const id = config.url!.split('/').pop()
    const project = getProjects().find(p => p.id === id)
    return project ? [200, project] : [404, { message: 'Project not found' }]
  })

  mock.onPost('/projects').reply((config) => {
    const data = JSON.parse(config.data)
    const projects = getProjects()
    const project: Project = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    projects.push(project)
    saveProjets(projects)
    return [201, project]
  })

  mock.onPut(/\/projects\/(\w+)$/).reply((config) => {
    const id = config.url!.split('/').pop()
    const data = JSON.parse(config.data)
    const projects = getProjects()
    const idx = projects.findIndex(p => p.id === id)
    if (idx === -1) return [404, { message: 'Project not found' }]
    projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() }
    saveProjets(projects)
    return [200, projects[idx]]
  })

  mock.onDelete(/\/projects\/(\w+)$/).reply((config) => {
    const id = config.url!.split('/').pop()
    const projects = getProjects().filter(p => p.id !== id)
    saveProjets(projects)
    const tasks = getTasks().filter(t => t.projectId !== id)
    saveTasks(tasks)
    return [204]
  })

  mock.onGet('/tasks').reply((config) => {
    const projectId = config.params?.projectId
    let tasks = getTasks()
    if (projectId && projectId !== '0') {
      tasks = tasks.filter(t => t.projectId === projectId)
    }
    tasks.sort((a, b) => a.order - b.order)
    return [200, tasks]
  })

  mock.onGet(/\/tasks\/(\w+)$/).reply((config) => {
    const id = config.url!.split('/').pop()
    const task = getTasks().find(t => t.id === id)
    return task ? [200, task] : [404, { message: 'Task not found' }]
  })

  mock.onPost('/tasks').reply((config) => {
    const data = JSON.parse(config.data)
    const tasks = getTasks()
    const projectTasks = tasks.filter(t => t.projectId === data.projectId)
    const task: Task = {
      ...data,
      id: uid(),
      order: projectTasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.push(task)
    saveTasks(tasks)
    return [201, task]
  })

  mock.onPut(/\/tasks\/(\w+)$/).reply((config) => {
    const id = config.url!.split('/').pop()
    const data = JSON.parse(config.data)
    const tasks = getTasks()
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1) return [404, { message: 'Task not found' }]
    tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() }
    saveTasks(tasks)
    return [200, tasks[idx]]
  })

  mock.onDelete(/\/tasks\/(\w+)$/).reply((config) => {
    const id = config.url!.split('/').pop()
    const tasks = getTasks().filter(t => t.id !== id)
    saveTasks(tasks)
    return [204]
  })

  mock.onPost('/tasks/reorder').reply((config) => {
    const { projectId, orderedIds } = JSON.parse(config.data)
    const tasks = getTasks()
    orderedIds.forEach((id: string, idx: number) => {
      const task = tasks.find(t => t.id === id && t.projectId === projectId)
      if (task) task.order = idx
    })
    saveTasks(tasks)
    return [200, { success: true }]
  })
}
