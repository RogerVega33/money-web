<template>
  <li class="py-3 sm:py-4">

    <!-- RESUMEN CATEGORÍA -->
    <div
        @click="toggleDetail"
        class="flex items-center space-x-4 text-gray-900 hover:text-blue-600 text-left w-full cursor-pointer"
    >
      <div class="flex-shrink-0">
        <fa icon="sack-dollar" class="text-green-700 h-8"/>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">
          {{ category.categoryName }}
        </p>
        <p class="text-sm truncate">
          {{ category.transactions?.length }} transacciones
        </p>
      </div>

      <div
          class="inline-flex items-center text-base font-semibold"
          :class="category.type === 'expense' ? 'text-red-500' : 'text-green-500'"
      >
        {{ category.type === 'expense' ? '-' : '+' }}
        {{ formatCurrency(category.total?.toFixed(2)) }}
      </div>
    </div>

    <!-- DETALLE -->
    <div v-show="showDetail">

      <div class="flex justify-between items-center mt-5">
        <span class="font-medium text-gray-900">Detalle</span>
      </div>

      <ul role="list" class="divide-y divide-gray-200">
        <li
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            class="py-3 sm:py-4"
        >

          <!-- EDICIÓN -->
          <TransactionEditForm
              v-if="isEditing(transaction)"
              :transaction="props.transactionSelected"
              :categories="categories"
              :saving="saving"
              title="Editar transacción"
              @save="emit('update', $event)"
              @cancel="emit('cancel-edit')"
          />

          <!-- ITEM NORMAL -->
          <div
              v-else
              class="flex items-center space-x-4 text-gray-900 hover:text-blue-600"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm truncate" :title="transaction.detail || 'Sin detalle'">
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

            <!-- MENÚ -->
            <div class="dropdown-menu">
              <Dropdown
                  :dropdown-id="transaction.id"
              >
                <template #trigger>
                  <button class="flex items-center text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                    <svg class="w-5 h-5" fill="currentColor">
                      <path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/>
                    </svg>
                  </button>
                </template>

                <template #menu="{ close }">
                  <div @click="() => { close(); handleNew(transaction) }" class="px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 cursor-pointer">
                    Nueva
                  </div>
                  <div @click="() => { close(); startEdit(transaction) }" class="px-4 py-2 text-sm text-sky-500 hover:bg-gray-100 cursor-pointer">
                    Editar
                  </div>
                  <div @click="() => { close(); handleDelete(transaction) }" class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer">
                    Eliminar
                  </div>
                </template>
              </Dropdown>
            </div>

          </div>
        </li>
      </ul>

      <!-- PAGINACIÓN -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-3">
        <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
        >
          ‹
        </button>
        <span class="text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'
import moment from 'moment'
import { formatCurrency } from '@/utils/formats'
import Dropdown from '@/components/common/Dropdown.vue'
import TransactionEditForm from './TransactionEditForm.vue'

const props = defineProps({
  category: Object,
  transactionsByCategory: Array,
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

const showDetail = ref(false)
const currentPage = ref(1)
const pageSize = 10

function toggleDetail() {
  showDetail.value = !showDetail.value
  if (showDetail.value) currentPage.value = 1
}

function isEditing(transaction) {
  return props.transactionSelected?.id === transaction.id && props.showEdit
}

function handleNew(transaction) {
  emit('new', transaction)
}

function startEdit(transaction) {
  emit('edit', transaction)
}

function handleDelete(transaction) {
  emit('delete', transaction)
}

const paginatedTransactions = computed(() => {
  if (!props.category?.transactions) return []
  const start = (currentPage.value - 1) * pageSize
  return props.category.transactions.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  return Math.ceil((props.category?.transactions?.length || 0) / pageSize)
})

function getTransactionDate(date) {
  return moment.utc(String(date)).format('DD/MM/yy')
}
</script>