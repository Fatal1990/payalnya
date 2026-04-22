<template>
  <div class="projects-view">
    <div class="projects-view__header">
      <div>
        <h1 class="projects-view__title">Projects</h1>
        <p class="projects-view__subtitle">Manage and track all your projects</p>
      </div>
    </div>

    <div v-if="store.loading && !store.projects.length" class="loading-spinner">
      Loading projects…
    </div>

    <template v-else>
      <div class="projects-view__stats">
        <StatsChart :stats="store.stats" />
      </div>
      <ProjectsTable
        @add="openAdd"
        @edit="openEdit"
        @delete="confirmDelete"
      />
    </template>
    <ProjectModal
      v-if="showModal"
      :project="editingProject"
      @close="closeModal"
      @saved="store.fetchProjects()"
    />
    <div v-if="deletingProject" class="modal-backdrop" @click.self="deletingProject = null">
      <div class="modal confirm-modal">
        <div class="modal__header">
          <h2>Delete Project</h2>
          <button @click="deletingProject = null">×</button>
        </div>
        <div class="modal__body">
          <p>Are you sure you want to delete <strong>{{ deletingProject.name }}</strong>?</p>
          <p class="confirm-modal__warning">This will also delete all tasks in this project. This action cannot be undone.</p>
        </div>
        <div class="modal__footer">
          <button class="btn-secondary" @click="deletingProject = null">Cancel</button>
          <button class="btn-danger" @click="doDelete">Delete Project</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import StatsChart from '@/components/common/StatsChart.vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'
import ProjectModal from '@/components/projects/ProjectModal.vue'
import type { Project } from '@/types'

const store = useProjectsStore()

const showModal = ref(false)
const editingProject = ref<Project | null>(null)
const deletingProject = ref<Project | null>(null)

onMounted(() => store.fetchProjects())

function openAdd() {
  editingProject.value = null
  showModal.value = true
}

function openEdit(project: Project) {
  editingProject.value = project
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProject.value = null
}

function confirmDelete(project: Project) {
  deletingProject.value = project
}

async function doDelete() {
  if (!deletingProject.value) return
  await store.deleteProject(deletingProject.value.id)
  deletingProject.value = null
}
</script>

<style lang="scss">
.projects-view {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__header {
    @include flex(row, space-between, flex-start);
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: 700;
    color: $gray-900;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $gray-500;
    margin-top: 4px;
  }

  &__stats {
    @include card;
    padding: 24px;
  }
}

.confirm-modal {
  &__warning {
    margin-top: 8px;
    font-size: $font-size-sm;
    color: $error;
  }
}
</style>
