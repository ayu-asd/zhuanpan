<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-emoji">🎉</div>
        <div class="modal-title">开奖结果</div>
        <div class="modal-result">{{ result?.text }}</div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="$emit('close')">
            好的
          </button>
          <button
            class="btn btn-ghost"
            @click="removeAndClose('temp')"
          >
            移除此项
          </button>
          <button
            class="btn btn-ghost"
            @click="removeAndClose('save')"
          >
            移除此项并保存
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  result: { type: Object, default: null }
})

const emit = defineEmits(['close', 'remove-temp', 'remove-save'])

function removeAndClose(mode) {
  if (mode === 'temp') {
    emit('remove-temp', props.result?.id)
  } else {
    emit('remove-save', props.result?.id)
  }
  emit('close')
}
</script>
