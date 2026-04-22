<template>
  <div class="tasks-table">
    <div class="tasks-table__toolbar">
      <div class="tasks-table__filters">
        <input
          class="tasks-table__search"
          placeholder="🔍 Search tasks…"
          :value="store.filters.search"
          @input="store.setFilters({ search: ($event.target as HTMLInputElement).value })"
        />
        <select
          :value="store.filters.status"
          @change="store.setFilters({ status: ($event.target as HTMLSelectElement).value as any })"
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
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
      <button class="btn-primary" @click="$emit('add')">+ New Task</button>
    </div>

    <div class="ag-theme-alpine tasks-table__grid">
      <AgGridVue
        :rowData="store.filteredTasks"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :animateRows="true"
        :rowDragManaged="true"
        :suppressMoveWhenRowDragging="true"
        rowSelection="single"
        @row-drag-end="onRowDragEnd"
        style="width: 100%; height: 100%;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { useTasksStore } from '@/stores/tasks'
import type { ColDef, ICellRendererParams, RowDragEndEvent } from 'ag-grid-community'
import type { Task } from '@/types'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{ add: []; edit: [task: Task]; delete: [task: Task] }>()

const store = useTasksStore()

function onRowDragEnd(e: RowDragEndEvent) {
  const rows: Task[] = []
  e.api.forEachNodeAfterFilterAndSort(node => rows.push(node.data))
  store.reorderTasks(props.projectId, rows)
}

const statusColors: Record<string, string> = {
  todo: '#6b7280', 'in-progress': '#f59e0b', done: '#10b981'
}
const statusLabels: Record<string, string> = {
  todo: 'To Do', 'in-progress': 'In Progress', done: 'Done'
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
  { rowDrag: true, width: 40, suppressMenu: true, sortable: false, resizable: false, filter: false },
  {
    headerName: 'Title', field: 'title', flex: 2, minWidth: 160,
    cellRenderer: (p: ICellRendererParams) =>
      `<span style="font-weight:600;color:#111827">${p.value || ''}</span>`
  },
  {
    headerName: 'Status', field: 'status', width: 140,
    cellRenderer: (p: ICellRendererParams) => badgeHtml(p.value, statusColors, statusLabels[p.value])
  },
  {
    headerName: 'Priority', field: 'priority', width: 120,
    cellRenderer: (p: ICellRendererParams) => badgeHtml(p.value, priorityColors)
  },
  {
    headerName: 'Assignee', field: 'assignee', width: 170,
    cellRenderer: (p: ICellRendererParams) => {
      if (!p.value) return '<span style="color:#9ca3af">—</span>'
      const initial = p.value[0].toUpperCase()
      return `<span style="display:flex;align-items:center;gap:6px">
        <span style="width:24px;height:24px;border-radius:50%;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">${initial}</span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.value}</span>
      </span>`
    }
  },
  {
    headerName: 'Due Date', field: 'dueDate', width: 120,
    cellRenderer: (p: ICellRendererParams) => {
      if (!p.value) return '<span style="color:#9ca3af">—</span>'
      const d = new Date(p.value)
      const isOverdue = d < new Date()
      return `<span style="color:${isOverdue ? '#ef4444' : '#374151'};font-weight:${isOverdue ? 600 : 400}">${d.toLocaleDateString('uk-UA')}</span>`
    }
  },
  {
    headerName: 'Actions', width: 100, sortable: false, filter: false,
    cellRenderer: (p: ICellRendererParams<Task>) => {
      const el = document.createElement('div')
      el.style.cssText = 'display:flex;gap:6px;align-items:center;height:100%'

      const editBtn = document.createElement('button')
      editBtn.textContent = '✏️'
      editBtn.title = 'Edit'
      editBtn.style.cssText = 'padding:4px 10px;font-size:13px;background:#f3f4f6;border:none;border-radius:6px;cursor:pointer'
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); emit('edit', p.data!) })

      const delBtn = document.createElement('button')
      delBtn.textContent = '🗑️'
      delBtn.title = 'Delete'
      delBtn.style.cssText = 'padding:4px 10px;font-size:13px;background:#fee2e2;border:none;border-radius:6px;cursor:pointer'
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
.tasks-table {
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
    max-width: 240px;
  }

  select {
    @include input-base;
    width: auto;
    cursor: pointer;
  }

  &__grid {
    height: 480px;
    width: 100%;
  }
}
</style>
