<template>
  <div class="stats-chart">
    <div class="stats-chart__cards">
      <div class="stat-card stat-card--total">
        <div class="stat-card__value">{{ stats.total }}</div>
        <div class="stat-card__label">Total</div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-card__value">{{ stats.active }}</div>
        <div class="stat-card__label">Active</div>
      </div>
      <div class="stat-card stat-card--completed">
        <div class="stat-card__value">{{ stats.completed }}</div>
        <div class="stat-card__label">Completed</div>
      </div>
      <div class="stat-card stat-card--on-hold">
        <div class="stat-card__value">{{ stats.onHold }}</div>
        <div class="stat-card__label">On Hold</div>
      </div>
    </div>
    <div class="stats-chart__canvas-wrap" v-if="stats.total > 0">
      <canvas ref="canvasRef" width="200" height="200"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import type { ProjectStats } from '@/types'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps<{ stats: ProjectStats }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function buildChart() {
  if (!canvasRef.value || props.stats.total === 0) return
  if (chart) chart.destroy()
  chart = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Completed', 'On Hold'],
      datasets: [{
        data: [props.stats.active, props.stats.completed, props.stats.onHold],
        backgroundColor: ['#10b981', '#6366f1', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 12 } } }
      }
    }
  })
}

onMounted(buildChart)
watch(() => props.stats, buildChart, { deep: true })
onUnmounted(() => chart?.destroy())
</script>

<style lang="scss">
.stats-chart {
  @include flex(row, flex-start, center, 32px);
  flex-wrap: wrap;

  &__cards {
    @include flex(row, flex-start, stretch, 16px);
    flex-wrap: wrap;
    flex: 1;
  }

  &__canvas-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.stat-card {
  @include card;
  padding: 20px 24px;
  min-width: 120px;
  flex: 1;
  border-top: 4px solid $gray-200;

  &__value {
    font-size: $font-size-3xl;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
  }

  &__label {
    font-size: $font-size-sm;
    color: $gray-500;
    font-weight: 500;
  }

  &--total    { border-top-color: $primary; .stat-card__value { color: $primary; } }
  &--active   { border-top-color: $success; .stat-card__value { color: $success; } }
  &--completed { border-top-color: $status-completed; .stat-card__value { color: $status-completed; } }
  &--on-hold  { border-top-color: $warning; .stat-card__value { color: $warning; } }
}
</style>
