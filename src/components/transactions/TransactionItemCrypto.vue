<template>
  <div class="flex items-center space-x-4 text-gray-900">

    <!-- ================= EDICIÓN ================= -->
    <div v-if="isEditing" class="w-full">
      <div :aria-busy="saving" class="flex items-center w-full bg-gray-50 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 px-3 py-1.5">
        <input
            v-model="localEdit.amount"
            type="text" inputmode="decimal" maxlength="12"
                @keydown="blockInvalidChars"
                @beforeinput="blockInvalidAmountInput"
                @paste="handleAmountPaste"
                @drop.prevent
            class="bg-transparent flex-1 text-sm text-gray-900 outline-none border-none ring-0 focus:ring-0"
            :disabled="saving"
            :aria-invalid="!!validationError"
            @keyup.enter="emitUpdate"
        />
        <span class="text-sm font-medium text-gray-700 mx-2">
          {{ transaction.symbol }}
        </span>
        <button @click="emitUpdate" :disabled="saving || !!validationError" class="text-green-600 hover:text-green-700 mx-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:text-green-600">
          <fa :icon="saving ? 'spinner' : 'check'" :class="{ 'animate-spin': saving }" />
        </button>
        <button @click="$emit('cancel-edit')" :disabled="saving" class="text-red-500 hover:text-red-600 mx-1 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:text-red-500">
          <fa icon="times" />
        </button>
      </div>
      <p v-if="validationError" role="alert" class="text-red-500 text-xs italic mt-2">{{ validationError }}</p>
    </div>

    <!-- ================= NORMAL ================= -->
    <template v-else>

      <!-- ICON -->
      <div class="flex-shrink-0">
        <fa icon="coins" class="text-yellow-500 h-8" />
      </div>

      <!-- INFO -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">
          {{ formatCryptoHoldings(transaction.amount) }} {{ transaction.symbol }}
        </p>
        <p class="text-sm truncate" :title="'Última actualización: ' + formatDateTime(transaction.date)">
          1 {{ transaction.symbol }} =
          {{ formatCurrency(transaction.price?.toFixed(2)) }}
        </p>
      </div>

      <!-- TOTAL -->
      <div class="inline-flex items-center text-base font-semibold text-green-500">
        {{ formatCurrency(transaction.total?.toFixed(2)) }}
      </div>

      <!-- DROPDOWN -->
      <Dropdown :dropdown-id="transaction.id">

      <template #trigger>
          <button class="p-1 hover:bg-gray-100 rounded">
            <svg class="w-5 h-5" fill="currentColor">
              <path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
          </button>
        </template>

        <template #menu="{ close }">
          <div
              @click="handleEdit(close)"
              class="px-4 py-2 text-sm text-sky-500 hover:bg-gray-100 cursor-pointer"
          >
            <fa icon="pencil"/> Editar
          </div>
          <div
              @click="handleDelete(close)"
              class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <fa icon="trash-can"/> Eliminar
          </div>
        </template>
      </Dropdown>

    </template>

  </div>
</template>

<script setup>
import { blockInvalidChars, blockInvalidAmountInput, handleAmountPaste } from '@/utils/inputValidation'
import { ref, computed, watch } from 'vue'
import { amountError } from '@/utils/dataValidation'
import { formatCurrency } from '@/utils/formats'
import Dropdown from '@/components/common/Dropdown.vue'
import { formatDateTime } from '@/utils/formats'

const props = defineProps({
  transaction: Object,
  transactionSelected: Object,
  showEdit: Boolean,
  saving: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['edit', 'delete', 'update', 'cancel-edit'])

const localEdit = ref({})
const validationError = computed(() =>
    localEdit.value.amount === undefined ? '' : amountError(localEdit.value.amount, true)
)

const isEditing = computed(() =>
    props.showEdit &&
    props.transactionSelected?.id === props.transaction?.id
)

watch(
    () => props.transactionSelected,
    (val) => {
      if (val?.id === props.transaction?.id) {
        localEdit.value = { ...props.transaction, amount: props.transaction.exactAmount ?? props.transaction.amount }
      }
    },
    { immediate: true }
)

function emitUpdate() {
  if (props.saving) return
  if (validationError.value) return

  emit('update', {
    ...localEdit.value,
    amount: localEdit.value.amount
  })
}

function handleEdit(close) {
  close()
  emit('edit', props.transaction)
}

function handleDelete(close) {
  close()
  emit('delete', props.transaction)
}

function formatCryptoHoldings(amount) {
  return Number(amount || 0).toFixed(6)
}
</script>