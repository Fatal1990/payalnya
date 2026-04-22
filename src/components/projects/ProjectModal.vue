<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__header">
        <h2>{{ isEdit ? 'Edit Project' : 'New Project' }}</h2>
        <button @click="$emit('close')">×</button>
      </div>

      <div class="modal__body">
        <div class="form-group">
          <label>Name *</label>
          <input v-model="form.name" placeholder="Project name" @blur="touch('name')" />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" placeholder="Brief description..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Status *</label>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
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

        <div class="form-group">
          <label>Deadline</label>
          <input type="date" v-model="form.deadline" />
        </div>
      </div>

      <div class="modal__footer">
        <button class="btn-secondary" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" :disabled="!isValid || loading" @click="submit">
          {{ loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types'

const props = defineProps<{ project?: Project | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const store = useProjectsStore()
const loading = ref(false)
const isEdit = computed(() => !!props.project)
const touched = reactive<Record<string, boolean>>({})

const form = reactive({
  name: props.project?.name ?? '',
  description: props.project?.description ?? '',
  status: props.project?.status ?? 'active',
  priority: props.project?.priority ?? 'medium',
  deadline: props.project?.deadline ?? ''
})

const errors = computed(() => ({
  name: touched.name && !form.name.trim() ? 'Name is required' : ''
}))

const isValid = computed(() => !!form.name.trim())

function touch(field: string) { touched[field] = true }

async function submit() {
  touched.name = true
  if (!isValid.value) return
  loading.value = true
  try {
    if (isEdit.value && props.project) {
      await store.updateProject(props.project.id, { ...form })
    } else {
      await store.createProject({ ...form } as any)
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
