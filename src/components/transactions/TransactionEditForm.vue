<template>
  <div class="relative w-full">
    <h6 class="font-semibold">{{ title }}</h6>

    <div class="mt-2">
      <label>Categoría</label>
      <Multiselect
          v-if="categories && categories.length"
          v-model="localEdit.categoryId"
          :options="categories"
          valueProp="id"
          :groups="true"
          :searchable="true"
          group-options="categoryList"
          group-label="category"
          track-by="name"
          label="name"
      />
    </div>

    <div class="mt-2">
      <label>Detalle</label>
      <input
          v-model="localEdit.detail"
          class="input"
          @keydown.enter.prevent="emitSave"
      />
    </div>

    <div class="mt-2">
      <label>Monto</label>
      <input
          type="number"
          v-model="localEdit.amount"
          class="input"
          @keydown="blockInvalidChars"
          @keydown.enter.prevent="emitSave"
      />
    </div>

    <div class="mt-2">
      <label>Fecha</label>
      <Datepicker
          v-model="localEdit.date"
          autoApply
          :enableTimePicker="false"
          format="dd/MM/yyyy"
      />
    </div>

    <div class="mt-4">
      <p v-if="error" class="text-red-500 text-xs italic mb-2">
        {{ error }}
      </p>

      <button
          class="btn-primary"
          :disabled="!canSave"
          @click="emitSave"
      >
        Guardar
      </button>

      <button
          class="btn-secondary mt-2"
          @click="emit('cancel')"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { blockInvalidChars } from '@/utils/inputValidation'

const props = defineProps({
  transaction: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Nueva transacción'
  }
})

const emit = defineEmits(['save', 'cancel'])

const localEdit = ref({ ...props.transaction })

const canSave = computed(() =>
    !!localEdit.value?.amount &&
    !!localEdit.value?.categoryId &&
    !!localEdit.value?.date
)

watch(() => props.transaction, (val) => {
  if (val) localEdit.value = { ...val }
})

function emitSave() {
  if (!canSave.value) return
  emit('save', { ...localEdit.value })
}
</script>

<style scoped>
.input {
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 100%;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  width: 100%;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  width: 100%;
}
</style>