<template>
  <div>

    <!-- ================= EDICIÓN ================= -->
    <TransactionEditForm
        v-if="isEditing"
        :transaction="transactionSelected"
        :categories="categories"
        title="Editar transacción"
        :saving="saving"
        @save="emit('update', $event)"
        @cancel="emit('cancel-edit')"
    />

    <!-- ================= NORMAL ================= -->
    <div
        v-else
        class="flex items-center space-x-4 text-gray-900 hover:text-blue-600"
    >
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">
          {{ transaction.categoryName }}
        </p>
        <p class="text-sm truncate">
          <span class="font-bold text-xs">
            {{ getTransactionDate(transaction.date) }}
          </span>
          | {{ transaction.detail || 'Sin detalle' }}
        </p>
      </div>

      <div
          class="inline-flex items-center text-sm"
          :class="transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'"
      >
        {{ transaction.type === 'expense' ? '-' : '+' }}
        {{ formatCurrency(transaction.amount?.toFixed(2)) }}
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
              @click="handleNew(close)"
              class="px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 cursor-pointer"
          >
            <fa icon="plus"/> Nueva
          </div>
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
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import moment from 'moment'
import { formatCurrency } from '@/utils/formats'
import Dropdown from '@/components/common/Dropdown.vue'
import TransactionEditForm from './TransactionEditForm.vue'

const props = defineProps({
  transaction: Object,
  transactionSelected: Object,
  showEdit: Boolean,
  categories: {
    type: Array,
    default: () => []
  },
  saving: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['new', 'edit', 'delete', 'update', 'cancel-edit'])

const isEditing = computed(() =>
    props.showEdit &&
    props.transactionSelected?.id === props.transaction?.id
)

function handleNew(close) {
  close()
  emit('new', props.transaction)
}

function handleEdit(close) {
  close()
  emit('edit', props.transaction)
}

function handleDelete(close) {
  close()
  emit('delete', props.transaction)
}

function getTransactionDate(date) {
  return moment.utc(String(date)).format('DD/MM/yy')
}
</script>