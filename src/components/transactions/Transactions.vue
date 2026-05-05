<template>
  <div class="transactions">
    <div class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8">

      <!-- HEADER -->
      <TransactionHeader
          ref="transactionList"
          :has-transactions="transactions?.transactions?.length > 0"
          :show-form="!showIconNewTransaction"
          :is-crypto="selectedWallet.type === 'crypto'"
          :show-by-category="searchSettings.showTransactionsByCategory"
          @toggle-form="addTransaction"
          @download="downloadTransactions"
      />

      <!-- NUEVA TRANSACCIÓN -->
      <div v-if="!showIconNewTransaction" class="mb-5">
        <hr class="mb-5">

        <!-- FIAT -->
        <TransactionEditForm
            v-if="selectedWallet.type !== 'crypto'"
            :transaction="newTransactionTemplate || {}"
            :categories="categories"
            :error="errorMessage"
            title="Nueva transacción"
            @save="saveTransaction"
            @cancel="cancelNewTransaction"
        />

        <!-- CRYPTO -->
        <div v-else>
          <h6 class="font-semibold">Nueva transacción</h6>

          <div class="mt-2">
            <label>Símbolo:</label>
            <input
                type="text"
                v-model="newCryptoTransaction.symbol"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5"
            />
          </div>

          <div class="mt-2">
            <label>Monto:</label>
            <input
                type="number"
                v-model="newCryptoTransaction.amount"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5"
                @keydown="blockInvalidChars"
            />
          </div>

          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mb-2">
              {{ errorMessage }}
            </p>
            <button
                type="button"
                class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-75 disabled:hover:bg-blue-500"
                :disabled="!newCryptoTransaction.symbol || !newCryptoTransaction.amount"
                @click="saveTransaction(newCryptoTransaction)"
            >
              Guardar
            </button>
            <button
                type="button"
                class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600"
                @click="cancelNewTransaction"
            >
              Cancelar
            </button>
          </div>
        </div>

        <hr class="mt-5">
      </div>

      <!-- =======================
           BARRA DE BÚSQUEDA
      ======================= -->
      <div class="relative w-full mb-4">
        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"/>
          </svg>
        </div>

        <input
            type="text"
            v-model="transactionFilter"
            placeholder="Buscar transacciones..."
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
        >
      </div>

      <!-- LISTA -->
      <TransactionList
          :transactions="searchSettings.showTransactionsByCategory ? transactions : paginatedTransactions"
          :transactions-by-category="searchSettings.showTransactionsByCategory ? paginatedCategories : transactionsByCategory"
          :search-settings="searchSettings"
          :wallet="selectedWallet"
          :categories="categories"
          :transaction-selected="transactionSelected"
          :show-edit="showEditTransactionSection"
          @new="addTransaction"
          @edit="showEditTransaction"
          @delete="deleteTransaction"
          @update="updateTransaction"
          @cancel-edit="cancel"
      />

      <!-- PAGINACIÓN -->
      <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change="currentPage = $event"
      />

    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch, nextTick} from 'vue'
import moment from 'moment'
import Swal from 'sweetalert2'

import TransactionHeader from './TransactionHeader.vue'
import TransactionEditForm from './TransactionEditForm.vue'
import TransactionList from './TransactionList.vue'
import Pagination from './Pagination.vue'

import CategoryService from "../../services/category.service"
import TransactionService from "../../services/transaction.service"
import { exportToCSV } from '@/utils/exportCSV'
import { blockInvalidChars } from '@/utils/inputValidation'

const props = defineProps([
  'transactions',
  'transactionsByCategory',
  'selectedWallet',
  'searchSettings'
])

const emit = defineEmits([
  'new-transaction',
  'new-crypto-transaction',
  'update-transaction',
  'update-crypto-transaction',
  'delete-transaction',
  'delete-crypto-transaction',
  'update-transaction-filter'
])

const categories = ref([])
const errorMessage = ref("")
const showIconNewTransaction = ref(true)

const transactionSelected = ref(null)
const showEditTransactionSection = ref(false)

const transactionList = ref(null)
const currentPage = ref(1)
const pageSize = 10

const newCryptoTransaction = ref({})
/* =======================
   SEARCH
======================= */
const transactionFilter = ref("")

/* =======================
   CATEGORÍAS
======================= */
function getCategories() {
  CategoryService.getCategories(props.selectedWallet.id).then((response) => {
    const incomes = response.data.body.filter(c => c.type === 'income')
    const expenses = response.data.body.filter(c => c.type === 'expense')
    // Las ordena en categoría Ingresos y Gastos para mostrar la lista
    categories.value = [
      { category: 'Ingresos', categoryList: incomes },
      { category: 'Gastos', categoryList: expenses }
    ]
  })
}

/* =======================
   NUEVA TRANSACCIÓN
======================= */
const newTransactionTemplate = ref(null)  // ← añadir esto

function addTransaction(transaction = null) {
  if (transaction?.id) {
    // Modo duplicar: abre el form con datos de la transacción como plantilla
    newTransactionTemplate.value = {
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      detail: transaction.detail,
      date: null  // fecha vacía para que el usuario la elija
    }
    showIconNewTransaction.value = false
  } else {
    // Modo normal: toggle del form vacío
    newTransactionTemplate.value = null
    showIconNewTransaction.value = !showIconNewTransaction.value
  }
}

function cancelNewTransaction() {
  showIconNewTransaction.value = true
  newTransactionTemplate.value = null
  newCryptoTransaction.value = {}
}
/* =======================
   GUARDAR
======================= */
function saveTransaction(form) {
  errorMessage.value = ''

  if (props.selectedWallet.type !== 'crypto') {
    const payload = {
      ...form,
      date: moment(form.date).format('YYYY-MM-DD')
    }

    TransactionService.saveTransaction(payload)
        .then(() => {
          cancelNewTransaction()
          emit('new-transaction')
        })
        .catch(handleError)

  } else {
    const payload = {
      ...form,
      walletId: props.selectedWallet.id
    }
    TransactionService.saveCryptoTransaction(payload)
        .then(() => {
          cancelNewTransaction()
          emit('new-crypto-transaction')
        })
        .catch(handleError)
  }
}

/* =======================
   EDITAR
======================= */
function showEditTransaction(transaction) {
  transactionSelected.value = {
    ...transaction,
    date: transaction.date
        ? moment(transaction.date, 'YYYY-MM-DD').toDate() // fix fecha
        : null
  }
  showEditTransactionSection.value = true
}

function updateTransaction(transaction) {
  if (props.selectedWallet.type !== 'crypto') {
    transaction.date = moment(transaction.date).format('YYYY-MM-DD')

    TransactionService.updateTransaction(transaction)
        .then(() => {
          cancel()
          emit('update-transaction')
        })
        .catch(() => Swal.fire("No se pudo editar la transacción", "", "error"))

  } else {
    TransactionService.updateCryptoTransaction(transaction)
        .then(() => {
          cancel()
          emit('update-crypto-transaction')
        })
        .catch(() => Swal.fire("No se pudo editar la transacción", "", "error"))
  }
}

/* =======================
   ELIMINAR
======================= */
function deleteTransaction(transaction) {

  Swal.fire({
    title: 'Eliminar transacción',
    text: '¿Seguro que deseas eliminar esta transacción?',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (!result.isConfirmed) return

    if (props.selectedWallet.type !== 'crypto') {
      TransactionService.deleteTransaction(transaction.id).then(() => {
        emit('delete-transaction', transaction)
      })
    } else {
      TransactionService.deleteCryptoTransaction(transaction.id).then(() => {
        emit('delete-crypto-transaction', transaction)
      })
    }
  })
}

/* =======================
   CANCEL EDIT
======================= */
function cancel() {
  transactionSelected.value = null
  showEditTransactionSection.value = false
}

/* =======================
   EXPORT CSV
======================= */
function downloadTransactions() {
  exportToCSV(props.transactions?.transactions)
}

/* =======================
   ERROR HANDLER
======================= */
function handleError(error) {
  errorMessage.value =
      error?.response?.data?.body?.message ||
      error.message ||
      error.toString()
}

/* =======================
   WATCHERS
======================= */
watch(() => props.selectedWallet, getCategories, { immediate: true })

watch(transactionFilter, () => {
  currentPage.value = 1
  emit('update-transaction-filter', transactionFilter.value)
})

watch(() => props.searchSettings, () => {
  transactionFilter.value = ""
  currentPage.value = 1
}, { deep: true })

watch(() => props.searchSettings.showTransactionsByCategory, () => {
  currentPage.value = 1
})

watch(currentPage, async () => {

  // cerrar categorías abiertas
  props.transactionsByCategory?.forEach(category => {
    category.showDetail = false
    category.currentPage = 1
  })

  // scroll arriba
  await nextTick()

  transactionList.value?.$el?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
})

/* =======================
   PAGINATION
======================= */
const paginatedTransactions = computed(() => {
  const list = props.transactions?.transactions || []

  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize

  return {
    ...props.transactions,
    transactions: list.slice(start, end)
  }
})

const paginatedCategories = computed(() => {
  const list = props.transactionsByCategory || []

  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize

  return list.slice(start, end)
})

const totalPages = computed(() => {
  if (props.searchSettings.showTransactionsByCategory) {
    return Math.ceil((props.transactionsByCategory?.length || 0) / pageSize)
  }

  const total = props.transactions?.transactions?.length || 0
  return Math.ceil(total / pageSize)
})

</script>