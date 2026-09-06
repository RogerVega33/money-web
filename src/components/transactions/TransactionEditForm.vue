<template>
  <div class="relative w-full" :aria-busy="props.saving">
    <h6 class="font-semibold">{{ title }}</h6>

    <div class="mt-2">
      <label>Categoría</label>
      <Multiselect
          v-if="categories && categories.length"
          v-model="localEdit.categoryId"
          :disabled="props.saving"
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
          maxlength="150"
          :disabled="props.saving"
          class="input"
          @keydown.enter.prevent="emitSave"
      />
    </div>

    <div class="mt-2">
      <label>Monto</label>
      <input
          type="text" inputmode="decimal" maxlength="13"
          @keydown="blockInvalidChars"
          @beforeinput="blockInvalidAmountInput"
          @paste="handleAmountPaste"
          @drop.prevent
          :disabled="props.saving"
          v-model="localEdit.amount"
          class="input"
          @keydown.enter.prevent="emitSave"
          :aria-invalid="!!amountValidationError"
      />
      <p v-if="amountValidationError" role="alert" class="text-red-500 text-xs italic mt-2">{{ amountValidationError }}</p>
    </div>

    <div class="mt-2">
      <label>Fecha</label>
      <Datepicker
          v-model="localEdit.date"
          :disabled="props.saving"
          autoApply
          :enableTimePicker="false"
          format="dd/MM/yyyy"
      />
    </div>

    <div class="mt-4">
      <p v-if="otherValidationError" class="text-red-500 text-xs mb-2">{{ otherValidationError }}</p>
      <p v-if="error" class="text-red-500 text-xs italic mb-2">
        {{ error }}
      </p>

      <button
          class="btn-primary disabled:opacity-75 disabled:cursor-not-allowed"
          :disabled="!canSave"
          @click="emitSave"
      >
        <template v-if="props.saving">Guardando<LoadingDots /></template>
        <template v-else>Guardar</template>
      </button>

      <button
          class="btn-secondary mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
          :disabled="props.saving"
          @click="emit('cancel')"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup>
import { blockInvalidChars, blockInvalidAmountInput, handleAmountPaste } from '@/utils/inputValidation'
import LoadingDots from '@/components/common/LoadingDots.vue'
import { ref, computed, watch } from 'vue'
import { amountError, textError, dateError } from '@/utils/dataValidation'
import moment from 'moment'

const props = defineProps({
  transaction: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  },
  saving: {
    type: Boolean,
    default: false
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

const amountValidationError = computed(() =>
  localEdit.value.amount === undefined ? '' : amountError(localEdit.value.amount)
)

const otherValidationError = computed(() => {
  const value = localEdit.value
  const detailMessage = textError(value.detail, 'El detalle', 150, true)
  if (detailMessage) return detailMessage
  if (value.date) return dateError(moment(value.date).format('YYYY-MM-DD'))
  return ''
})

const validationError = computed(() => amountValidationError.value || otherValidationError.value)

const canSave = computed(() =>
    !validationError.value &&
    !props.saving &&
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