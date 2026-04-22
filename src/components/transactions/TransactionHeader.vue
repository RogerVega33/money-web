<template>
  <div class="flex justify-between items-center mb-4" ref="root">

    <h5 v-if="!isCrypto"
        class="text-xl font-bold leading-none text-gray-900">
      Transacciones{{ showByCategory ? ' x categoría' : '' }}
    </h5>

    <h5 v-else
        class="text-xl font-bold leading-none text-gray-900">
      Holdings
    </h5>

    <div>
      <fa icon="download"
          v-if="hasTransactions"
          class="cursor-pointer text-blue-500 mr-3"
          title="Descargar CSV"
          @click="$emit('download')" />

      <fa :icon="showForm ? 'xmark' : 'plus'"
          class="cursor-pointer"
          title="Nueva transacción"
          :class="showForm ? 'text-red-600' : 'text-green-600'"
          @click="$emit('toggle-form')" />
    </div>

  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

defineProps({
  hasTransactions: Boolean,
  showForm: Boolean,
  isCrypto: Boolean,
  showByCategory: Boolean,
})

const root = ref(null)

defineExpose({
  root
})
</script>