import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification, ViewMode } from '@/types'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useUiStore = defineStore('ui', () => {
  const notifications = ref<Notification[]>([])
  const viewMode = ref<ViewMode>((localStorage.getItem('pm_viewMode') as ViewMode) || 'table')
  const isLoading = ref(false)

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
    localStorage.setItem('pm_viewMode', mode)
  }

  function notify(type: Notification['type'], message: string, duration = 3500) {
    const notification: Notification = { id: uid(), type, message, duration }
    notifications.value.push(notification)
    setTimeout(() => removeNotification(notification.id), duration)
  }

  function removeNotification(id: string) {
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx !== -1) notifications.value.splice(idx, 1)
  }

  function setLoading(val: boolean) {
    isLoading.value = val
  }

  return { notifications, viewMode, isLoading, setViewMode, notify, removeNotification, setLoading }
})
