<template>
  <div class="kanban">
    <div
      v-for="col in columns"
      :key="col.status"
      class="kanban__col"
      :class="`kanban__col--${col.status}`"
    >
      <div class="kanban__col-header">
        <div class="kanban__col-title">
          <span class="kanban__col-dot" :style="{ background: col.color }"></span>
          {{ col.label }}
        </div>
        <span class="kanban__col-count">{{ store.tasksByStatus[col.status].length }}</span>
      </div>

      <VueDraggable
        v-model="lists[col.status]"
        group="tasks"
        animation="200"
        ghost-class="kanban__card--ghost"
        chosen-class="kanban__card--chosen"
        drag-class="kanban__card--drag"
        class="kanban__list"
        @end="onDragEnd($event, col.status)"
      >
        <div
          v-for="task in lists[col.status]"
          :key="task.id"
          class="kanban__card"
          :class="`kanban__card--priority-${task.priority}`"
        >
          <div class="kanban__card-header">
            <span class="kanban__card-priority" :style="{ background: priorityColor(task.priority) }">
              {{ task.priority }}
            </span>
            <div class="kanban__card-actions">
              <button @click="$emit('edit', task)" title="Edit">✏️</button>
              <button @click="$emit('delete', task)" title="Delete">🗑️</button>
            </div>
          </div>

          <div class="kanban__card-title">{{ task.title }}</div>

          <div class="kanban__card-desc" v-if="task.description">{{ task.description }}</div>

          <div class="kanban__card-footer">
            <span v-if="task.assignee" class="kanban__card-assignee">
              <span class="kanban__card-avatar">{{ task.assignee[0].toUpperCase() }}</span>
              {{ task.assignee.split(' ')[0] }}
            </span>
            <span v-if="task.dueDate" class="kanban__card-due" :class="{ overdue: isOverdue(task.dueDate) }">
              📅 {{ formatDate(task.dueDate) }}
            </span>
          </div>
        </div>

        <div v-if="lists[col.status].length === 0" class="kanban__empty">
          Drop tasks here
        </div>
      </VueDraggable>

      <button class="kanban__add-btn" @click="$emit('add', col.status)">
        + Add Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useTasksStore } from '@/stores/tasks'
import type { Task, TaskStatus } from '@/types'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{
  edit: [task: Task]
  delete: [task: Task]
  add: [status: TaskStatus]
}>()

const store = useTasksStore()

const columns = [
  { status: 'todo' as TaskStatus,        label: 'To Do',      color: '#6b7280' },
  { status: 'in-progress' as TaskStatus, label: 'In Progress', color: '#f59e0b' },
  { status: 'done' as TaskStatus,        label: 'Done',       color: '#10b981' }
]

const lists = reactive<Record<TaskStatus, Task[]>>({
  todo: [],
  'in-progress': [],
  done: []
})

watch(
  () => store.tasksByStatus,
  (val) => {
    lists.todo = [...val.todo]
    lists['in-progress'] = [...val['in-progress']]
    lists.done = [...val.done]
  },
  { immediate: true, deep: true }
)

async function onDragEnd(event: any, newStatus: TaskStatus) {
  const draggedEl = event.item
  const taskId = draggedEl.getAttribute('data-id') || ''

  for (const status of Object.keys(lists) as TaskStatus[]) {
    for (const task of lists[status]) {
      if (task.status !== status) {
        await store.moveTask(task.id, status)
      }
    }
  }

  await store.reorderTasks(props.projectId, [
    ...lists.todo,
    ...lists['in-progress'],
    ...lists.done
  ])
}

function priorityColor(priority: string) {
  const map: Record<string, string> = {
    low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
  }
  return map[priority] || '#9ca3af'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })
}

function isOverdue(date: string) {
  return new Date(date) < new Date()
}
</script>

<style lang="scss">
.kanban {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;

  @include respond-to(md) {
    grid-template-columns: 1fr;
  }

  &__col {
    @include card;
    display: flex;
    flex-direction: column;
    min-height: 400px;
    overflow: hidden;

    &--todo        { border-top: 3px solid #6b7280; }
    &--in-progress { border-top: 3px solid #f59e0b; }
    &--done        { border-top: 3px solid #10b981; }
  }

  &__col-header {
    @include flex(row, space-between, center);
    padding: 14px 16px;
    border-bottom: 1px solid $gray-100;
  }

  &__col-title {
    @include flex(row, flex-start, center, 8px);
    font-weight: 600;
    font-size: $font-size-sm;
    color: $gray-800;
  }

  &__col-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__col-count {
    background: $gray-100;
    color: $gray-600;
    font-size: $font-size-xs;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }

  &__list {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 100px;
  }

  &__card {
    background: white;
    border: 1px solid $gray-200;
    border-radius: $border-radius;
    padding: 12px 14px;
    cursor: grab;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: $shadow-sm;
    transition: box-shadow $transition, transform $transition;

    &:hover { box-shadow: $shadow-md; transform: translateY(-1px); }

    &--ghost  { opacity: 0.4; background: $gray-100; }
    &--chosen { box-shadow: $shadow-lg; }
    &--drag   { opacity: 0.9; transform: rotate(2deg); }
  }

  &__card-header {
    @include flex(row, space-between, center);
  }

  &__card-priority {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 8px;
    border-radius: 999px;
    color: white;
  }

  &__card-actions {
    @include flex(row, flex-end, center, 4px);
    opacity: 0;
    transition: opacity $transition;

    button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background $transition;
      &:hover { background: $gray-100; }
    }
  }

  &__card:hover &__card-actions { opacity: 1; }

  &__card-title {
    font-weight: 600;
    font-size: $font-size-sm;
    color: $gray-900;
    line-height: 1.4;
  }

  &__card-desc {
    font-size: $font-size-xs;
    color: $gray-500;
    line-height: 1.4;
    @include truncate;
  }

  &__card-footer {
    @include flex(row, space-between, center);
    margin-top: 4px;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__card-assignee {
    @include flex(row, flex-start, center, 5px);
    font-size: $font-size-xs;
    color: $gray-600;
  }

  &__card-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $primary;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__card-due {
    font-size: $font-size-xs;
    color: $gray-500;
    &.overdue { color: $error; font-weight: 600; }
  }

  &__empty {
    @include flex(column, center, center);
    height: 80px;
    border: 2px dashed $gray-200;
    border-radius: $border-radius;
    color: $gray-400;
    font-size: $font-size-sm;
  }

  &__add-btn {
    width: 100%;
    padding: 10px;
    background: none;
    border: none;
    border-top: 1px solid $gray-100;
    color: $gray-500;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition;
    font-family: $font-family;
    font-weight: 500;
    &:hover { background: $gray-50; color: $primary; }
  }
}
</style>
