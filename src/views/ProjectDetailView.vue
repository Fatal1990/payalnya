<template>
  <div class="detail-view">
    <div class="detail-view__header">
      <div class="detail-view__meta">
        <h1 class="detail-view__title">{{ project?.name || 'Project' }}</h1>
        <p class="detail-view__desc">{{ project?.description }}</p>
        <div class="detail-view__badges" v-if="project">
          <span :class="`badge badge--${project.status}`">{{ project.status }}</span>
          <span :class="`badge badge--${project.priority}`">{{ project.priority }}</span>
          <span v-if="project.deadline" class="detail-view__deadline">
            📅 {{ new Date(project.deadline).toLocaleDateString('uk-UA') }}
          </span>
        </div>
      </div>
      <div class="detail-view__header-actions">
        <button class="btn-secondary" @click="$router.back()">← Back</button>
        <button class="btn-secondary" @click="openEditProject">✏️ Edit Project</button>
        <button class="btn-primary" @click="openAddTask">+ New Task</button>
      </div>
    </div>
    <div class="detail-view__task-stats">
      <div class="task-stat">
        <span class="task-stat__num">{{ tasksStore.stats.total }}</span>
        <span class="task-stat__label">Total</span>
      </div>
      <div class="task-stat task-stat--todo">
        <span class="task-stat__num">{{ tasksStore.stats.todo }}</span>
        <span class="task-stat__label">To Do</span>
      </div>
      <div class="task-stat task-stat--progress">
        <span class="task-stat__num">{{ tasksStore.stats.inProgress }}</span>
        <span class="task-stat__label">In Progress</span>
      </div>
      <div class="task-stat task-stat--done">
        <span class="task-stat__num">{{ tasksStore.stats.done }}</span>
        <span class="task-stat__label">Done</span>
      </div>
      <div class="task-stat__progress-bar">
        <div
          class="task-stat__progress-fill"
          :style="{ width: progressPct + '%' }"
        ></div>
      </div>
    </div>
    <div class="detail-view__view-toggle">
      <button
        class="toggle-btn"
        :class="{ 'toggle-btn--active': uiStore.viewMode === 'table' }"
        @click="uiStore.setViewMode('table')"
      >
        📊 Table
      </button>
      <button
        class="toggle-btn"
        :class="{ 'toggle-btn--active': uiStore.viewMode === 'kanban' }"
        @click="uiStore.setViewMode('kanban')"
      >
        🗂️ Kanban
      </button>
    </div>
    <div v-if="tasksStore.loading && !tasksStore.tasks.length" class="loading-spinner">
      Loading tasks…
    </div>
    <template v-else>
      <TasksTable
        v-if="uiStore.viewMode === 'table'"
        :projectId="projectId"
        @add="openAddTask"
        @edit="openEditTask"
        @delete="confirmDeleteTask"
      />
      <TasksKanban
        v-else
        :projectId="projectId"
        @add="openAddTaskWithStatus"
        @edit="openEditTask"
        @delete="confirmDeleteTask"
      />
    </template>
    <TaskModal
      v-if="showTaskModal"
      :task="editingTask"
      :project-id="projectId"
      @close="closeTaskModal"
      @saved="tasksStore.fetchTasks(projectId)"
    />
    <ProjectModal
      v-if="showProjectModal && project"
      :project="project"
      @close="showProjectModal = false"
      @saved="projectsStore.fetchProjects()"
    />
    <div v-if="deletingTask" class="modal-backdrop" @click.self="deletingTask = null">
      <div class="modal">
        <div class="modal__header">
          <h2>Delete Task</h2>
          <button @click="deletingTask = null">×</button>
        </div>
        <div class="modal__body">
          <p>Are you sure you want to delete <strong>{{ deletingTask.title }}</strong>?</p>
        </div>
        <div class="modal__footer">
          <button class="btn-secondary" @click="deletingTask = null">Cancel</button>
          <button class="btn-danger" @click="doDeleteTask">Delete Task</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'
import TasksTable from '@/components/tasks/TasksTable.vue'
import TasksKanban from '@/components/tasks/TasksKanban.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'
import ProjectModal from '@/components/projects/ProjectModal.vue'
import type { Task, TaskStatus } from '@/types'

const route = useRoute()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const uiStore = useUiStore()

const projectId = route.params.id as string
const project = computed(() => projectsStore.getById(projectId))

const showTaskModal = ref(false)
const showProjectModal = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTask = ref<Task | null>(null)

const progressPct = computed(() => {
  const total = tasksStore.stats.total
  if (!total) return 0
  return Math.round((tasksStore.stats.done / total) * 100)
})

onMounted(async () => {
  if (!projectsStore.projects.length) await projectsStore.fetchProjects()
  await tasksStore.fetchTasks(projectId)
})

onUnmounted(() => tasksStore.clearTasks())

function openAddTask() {
  editingTask.value = null
  showTaskModal.value = true
}

function openAddTaskWithStatus(_status: TaskStatus) {
  editingTask.value = null
  showTaskModal.value = true
}

function openEditTask(task: Task) {
  editingTask.value = task
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
  editingTask.value = null
}

function confirmDeleteTask(task: Task) {
  deletingTask.value = task
}

async function doDeleteTask() {
  if (!deletingTask.value) return
  await tasksStore.deleteTask(deletingTask.value.id)
  deletingTask.value = null
}

function openEditProject() {
  showProjectModal.value = true
}
</script>

<style lang="scss">
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__header {
    @include flex(row, space-between, flex-start, 16px);
    flex-wrap: wrap;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $gray-900;
    letter-spacing: -0.01em;
  }

  &__desc {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-top: 4px;
    max-width: 600px;
  }

  &__badges {
    @include flex(row, flex-start, center, 8px);
    margin-top: 10px;
  }

  &__deadline {
    font-size: $font-size-xs;
    color: $gray-500;
  }

  &__header-actions {
    @include flex(row, flex-end, center, 10px);
    flex-wrap: wrap;
  }

  &__task-stats {
    @include card;
    padding: 16px 24px;
    @include flex(row, flex-start, center, 24px);
    flex-wrap: wrap;
    position: relative;
  }

  &__view-toggle {
    @include flex(row, flex-start, center, 4px);
  }
}

.task-stat {
  @include flex(column, flex-start, flex-start, 2px);

  &__num {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $gray-800;
  }

  &__label {
    font-size: $font-size-xs;
    color: $gray-500;
    font-weight: 500;
  }

  &--todo    .task-stat__num { color: $gray-600; }
  &--progress .task-stat__num { color: $warning; }
  &--done    .task-stat__num { color: $success; }

  &__progress-bar {
    flex: 1;
    min-width: 120px;
    height: 8px;
    background: $gray-200;
    border-radius: 999px;
    overflow: hidden;
    align-self: center;
  }

  &__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $primary, $success);
    border-radius: 999px;
    transition: width 0.5s ease;
  }
}

.toggle-btn {
  padding: 8px 16px;
  border: 1px solid $gray-200;
  border-radius: $border-radius;
  background: white;
  color: $gray-600;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition;
  font-family: $font-family;

  &:hover { background: $gray-50; }

  &--active {
    background: $primary;
    color: white;
    border-color: $primary;
  }
}
</style>
