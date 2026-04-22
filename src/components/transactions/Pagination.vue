<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4">

    <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
    >
      ‹
    </button>

    <span class="text-sm text-gray-600">
      {{ currentPage }} / {{ totalPages }}
    </span>

    <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
    >
      ›
    </button>

  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['change'])

function changePage(page) {
  if (page < 1 || page > props.totalPages) return
  emit('change', page)
}
</script>