<template>
  <div class="projects-table">
    <div class="projects-table__toolbar">
      <div class="projects-table__filters">
        <input
          class="projects-table__search"
          placeholder="🔍 Search projects…"
          :value="store.filters.search"
          @input="store.setFilters({ search: ($event.target as HTMLInputElement).value })"
        />
        <select
          :value="store.filters.status"
          @change="store.setFilters({ status: ($event.target as HTMLSelectElement).value as any })"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <select
          :value="store.filters.priority"
          @change="store.setFilters({ priority: ($event.target as HTMLSelectElement).value as any })"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <button class="btn-primary" @click="$emit('add')">+ New Project</button>
    </div>

    <div class="ag-theme-alpine projects-table__grid">
      <AgGridVue
        :rowData="store.filteredProjects"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :animateRows="true"
        :pagination="true"
        :paginationPageSize="10"
        rowSelection="single"
        @row-clicked="onRowClick"
        style="width: 100%; height: 100%;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { useProjectsStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import type { Project } from '@/types'

const emit = defineEmits<{ add: []; edit: [project: Project]; delete: [project: Project] }>()

const store = useProjectsStore()
const router = useRouter()

function onRowClick(e: { data: Project }) {
  router.push(`/projects/${e.data.id}`)
}

const statusColors: Record<string, string> = {
  active: '#10b981', 'on-hold': '#f59e0b', completed: '#6366f1', archived: '#9ca3af'
}
const priorityColors: Record<string, string> = {
  low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
}

function badgeHtml(value: string, colorMap: Record<string, string>, label?: string) {
  const color = colorMap[value] || '#9ca3af'
  const textColor = color === '#f59e0b' ? '#111' : '#fff'
  return `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;background:${color};color:${textColor};text-transform:uppercase;letter-spacing:0.05em">${label || value}</span>`
}

const columnDefs: ColDef[] = [
  {
    headerName: 'Name', field: 'name', minWidth: 180, flex: 2,
    cellRenderer: (p: ICellRendererParams) =>
      `<span style="font-weight:600;color:#4f46e5;cursor:pointer">${p.value}</span>`
  },
  {
    headerName: 'Description', field: 'description', flex: 3, minWidth: 200,
    cellRenderer: (p: ICellRendererParams) =>
      `<span style="color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${p.value || ''}</span>`
  },
  {
    headerName: 'Status', field: 'status', width: 130,
    cellRenderer: (p: ICellRendererParams) => badgeHtml(p.value, statusColors)
  },
  {
    headerName: 'Priority', field: 'priority', width: 120,
    cellRenderer: (p: ICellRendererParams) => badgeHtml(p.value, priorityColors)
  },
  {
    headerName: 'Deadline', field: 'deadline', width: 130,
    cellRenderer: (p: ICellRendererParams) => {
      if (!p.value) return '<span style="color:#9ca3af">—</span>'
      const d = new Date(p.value)
      const isOverdue = d < new Date()
      const color = isOverdue ? '#ef4444' : '#374151'
      const weight = isOverdue ? '600' : '400'
      return `<span style="color:${color};font-weight:${weight}">${d.toLocaleDateString('uk-UA')}</span>`
    }
  },
  {
    headerName: 'Actions', width: 140, sortable: false, filter: false,
    cellRenderer: (p: ICellRendererParams<Project>) => {
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;gap:6px;align-items:center;height:100%'

      const editBtn = document.createElement('button')
      editBtn.textContent = '✏️ Edit'
      editBtn.style.cssText = 'padding:4px 10px;font-size:12px;background:#f3f4f6;border:none;border-radius:6px;cursor:pointer;font-weight:500'
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); emit('edit', p.data!) })

      const delBtn = document.createElement('button')
      delBtn.textContent = '🗑️'
      delBtn.style.cssText = 'padding:4px 10px;font-size:12px;background:#fee2e2;border:none;border-radius:6px;cursor:pointer'
      delBtn.addEventListener('click', (e) => { e.stopPropagation(); emit('delete', p.data!) })

      el.appendChild(editBtn)
      el.appendChild(delBtn)
      return el
    }
  }
]

const defaultColDef: ColDef = { sortable: true, resizable: true, filter: true }
</script>

<style lang="scss">
.projects-table {
  @include card;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__toolbar {
    @include flex(row, space-between, center, 12px);
    padding: 16px 20px;
    border-bottom: 1px solid $gray-200;
    flex-wrap: wrap;
  }

  &__filters {
    @include flex(row, flex-start, center, 10px);
    flex-wrap: wrap;
    flex: 1;
  }

  &__search {
    @include input-base;
    max-width: 260px;
  }

  select {
    @include input-base;
    width: auto;
    cursor: pointer;
  }

  &__grid {
    height: 520px;
    width: 100%;
  }
}
</style>
