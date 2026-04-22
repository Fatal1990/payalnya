<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__header">
        <h2>{{ isEdit ? 'Edit Task' : 'New Task' }}</h2>
        <button @click="$emit('close')">×</button>
      </div>

      <div class="modal__body">
        <div class="form-group">
          <label>Title *</label>
          <input v-model="form.title" placeholder="Task title" @blur="touch('title')" />
          <span v-if="errors.title" class="error-msg">{{ errors.title }}</span>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" placeholder="Task details..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Status *</label>
            <select v-model="form.status">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="form-group">
            <label>Priority *</label>
            <select v-model="form.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Assignee</label>
            <input v-model="form.assignee" placeholder="Assignee name" list="assignees-list" />
            <datalist id="assignees-list">
              <option v-for="a in tasksStore.assignees" :key="a" :value="a" />
            </datalist>
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input type="date" v-model="form.dueDate" />
          </div>
        </div>
      </div>

      <div class="modal__footer">
        <button class="btn-secondary" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" :disabled="!isValid || loading" @click="submit">
          {{ loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types'

const props = defineProps<{
  task?: Task | null
  projectId: string
}>()
const emit = defineEmits<{ close: []; saved: [] }>()

const tasksStore = useTasksStore()
const loading = ref(false)
const isEdit = computed(() => !!props.task)
const touched = reactive<Record<string, boolean>>({})

const form = reactive({
  title: props.task?.title ?? '',
  description: props.task?.description ?? '',
  status: props.task?.status ?? 'todo',
  priority: props.task?.priority ?? 'medium',
  assignee: props.task?.assignee ?? '',
  dueDate: props.task?.dueDate ?? ''
})

const errors = computed(() => ({
  title: touched.title && !form.title.trim() ? 'Title is required' : ''
}))

const isValid = computed(() => !!form.title.trim())

function touch(field: string) { touched[field] = true }

async function submit() {
  touched.title = true
  if (!isValid.value) return
  loading.value = true
  try {
    if (isEdit.value && props.task) {
      await tasksStore.updateTask(props.task.id, { ...form })
    } else {
      await tasksStore.createTask({ ...form, projectId: props.projectId } as any)
    }
    emit('saved')
    emit('close')
  } catch {
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
