<template>
  <div class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" :open="currentOpen" />
    </div>
    <div
        v-if="currentOpen"
        class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50"
    >
      <slot name="menu" :close="close" />
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useDropdown} from '@/composables/useDropdown'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: undefined
  },
  dropdownId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['toggle', 'close'])

const {openDropdown, closeDropdown, isOpen} = useDropdown()

const currentOpen = computed(() => {
  if (props.isOpen !== undefined) return props.isOpen
  if (props.dropdownId !== null) return isOpen(props.dropdownId)
  return false
})

function toggle(e) {
  e.stopPropagation()
  if (props.isOpen !== undefined) {
    emit('toggle')
  } else if (props.dropdownId !== null) {
    if (isOpen(props.dropdownId)) {
      closeDropdown(props.dropdownId)
    } else {
      openDropdown(props.dropdownId)
    }
  }
}

function close() {
  if (props.isOpen !== undefined) {
    emit('close')
  } else if (props.dropdownId !== null) {
    closeDropdown(props.dropdownId)
  }
}
</script>