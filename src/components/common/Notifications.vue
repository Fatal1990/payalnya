<template>
  <Teleport to="body">
    <div class="notifications">
      <TransitionGroup name="notif">
        <div
          v-for="n in uiStore.notifications"
          :key="n.id"
          class="notif"
          :class="`notif--${n.type}`"
          @click="uiStore.removeNotification(n.id)"
        >
          <span class="notif__icon">{{ icons[n.type] }}</span>
          <span class="notif__msg">{{ n.message }}</span>
          <button class="notif__close">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}
</script>

<style lang="scss">
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
  width: 100%;
}

.notif {
  @include flex(row, flex-start, center, 10px);
  padding: 12px 16px;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  cursor: pointer;
  animation: slideInRight 0.25s ease;
  border-left: 4px solid transparent;
  background: white;

  &--success { border-left-color: $success; }
  &--error   { border-left-color: $error; }
  &--warning { border-left-color: $warning; }
  &--info    { border-left-color: $info; }

  &__icon { font-size: 16px; flex-shrink: 0; }
  &__msg  { flex: 1; font-size: $font-size-sm; color: $gray-800; line-height: 1.4; }
  &__close {
    background: none;
    border: none;
    cursor: pointer;
    color: $gray-400;
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
    padding: 0 2px;
    &:hover { color: $gray-700; }
  }
}

.notif-enter-active { animation: slideInRight 0.25s ease; }
.notif-leave-active { animation: slideInRight 0.2s ease reverse; }
.notif-move         { transition: transform 0.2s ease; }
</style>
