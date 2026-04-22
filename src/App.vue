<template>
  <div class="app">
    <div class="main-wrapper">
      <header class="header">
        <div class="header__breadcrumb">
          <RouterLink to="/projects" class="header__breadcrumb-home">Projects</RouterLink>
          <template v-if="route.name === 'project-detail'">
            <span class="header__breadcrumb-sep">›</span>
            <span class="header__breadcrumb-current">{{ currentProjectName }}</span>
          </template>
        </div>
      </header>

      <main class="main-content">
        <RouterView />
      </main>
    </div>

    <Notifications />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import Notifications from '@/components/common/Notifications.vue'

const route = useRoute()
const projectsStore = useProjectsStore()

const currentProjectName = computed(() => {
  const id = route.params.id as string
  return projectsStore.getById(id)?.name || 'Project Detail'
})
</script>

<style lang="scss">
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: $header-height;
  min-height: $header-height;
  background: white;
  border-bottom: 1px solid $gray-200;
  @include flex(row, space-between, center);
  padding: 0 28px;
  box-shadow: $shadow-sm;

  &__breadcrumb {
    @include flex(row, flex-start, center, 8px);
    font-size: $font-size-sm;
    color: $gray-500;
  }

  &__breadcrumb-home {
    color: $primary;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }

  &__breadcrumb-sep { color: $gray-400; }

  &__breadcrumb-current {
    color: $gray-800;
    font-weight: 600;
  }

  &__status {
    font-size: $font-size-xs;
    color: $gray-500;
    background: $gray-100;
    padding: 4px 10px;
    border-radius: 999px;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}
</style>
