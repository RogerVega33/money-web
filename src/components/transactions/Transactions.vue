<template>
  <div class="transactions" :aria-busy="loading || loadingCategories">
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
        <p v-if="loadingCategories" class="text-gray-600" role="status">Cargando categorías<LoadingDots /></p>
        <div v-else-if="categoriesError" role="alert"><p>No se pudieron cargar las categorías.</p><button type="button" class="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500" @click="getCategories">Reintentar</button></div>
        <p v-else-if="selectedWallet.type !== 'crypto' && !categories.some(group => group.categoryList.length)" class="text-gray-600">Todavía no tienes categorías en esta billetera. Usa el botón ⚙️ para agregar una.</p>
        <TransactionEditForm
            v-else-if="selectedWallet.type !== 'crypto'"
            :transaction="newTransactionTemplate || {}"
            :categories="categories"
            :error="errorMessage"
            :saving="isSavingTransaction"
            title="Nueva transacción"
            @save="saveTransaction"
            @cancel="cancelNewTransaction"
        />

        <!-- CRYPTO -->
        <div v-else :aria-busy="isSavingTransaction">
          <h6 class="font-semibold">Nueva transacción</h6>

          <div class="mt-2">
            <label>Símbolo:</label>
            <input
                type="text"
                v-model="newCryptoTransaction.symbol"
                maxlength="10"
                :disabled="isSavingTransaction"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5"
            />
          </div>

          <div class="mt-2">
            <label>Monto:</label>
            <input
                type="text" inputmode="decimal" maxlength="12"
                @keydown="blockInvalidChars"
                @beforeinput="blockInvalidAmountInput"
                @paste="handleAmountPaste"
                @drop.prevent
                :disabled="isSavingTransaction"
                v-model="newCryptoTransaction.amount"
                :aria-invalid="!!cryptoAmountError"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 p-2.5"
            />
            <p v-if="cryptoAmountError" role="alert" class="text-red-500 text-xs italic mt-2">{{ cryptoAmountError }}</p>
          </div>

          <div class="mt-4">
            <p v-if="errorMessage" class="text-red-500 text-xs italic mb-2">
              {{ errorMessage }}
            </p>
            <button
                type="button"
                class="text-white font-bold py-2 px-4 rounded-lg w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                :disabled="!newCryptoTransaction.symbol || !newCryptoTransaction.amount || !!cryptoAmountError || isSavingTransaction"
                @click="saveTransaction(newCryptoTransaction)"
            >
              <template v-if="isSavingTransaction">Guardando<LoadingDots /></template>
        <template v-else>Guardar</template>
            </button>
            <button
                type="button"
                class="mt-2 text-white font-bold py-2 px-4 rounded-lg w-full bg-gray-500 hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-gray-500"
                :disabled="isSavingTransaction"
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
                 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5"
        >
        <button
            v-if="transactionFilter"
            type="button"
            aria-label="Limpiar"
            title="Limpiar"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-500 rounded-r-lg"
            @click="transactionFilter = ''"
        >
          <fa icon="eraser" />
        </button>
      </div>

      <!-- LISTA -->
      <p v-if="loading || loadingCategories" class="text-gray-600" role="status">Cargando transacciones<LoadingDots /></p>
      <div v-else-if="loadError || categoriesError" class="text-gray-600" role="alert">
        <p>{{ loadError ? 'No se pudieron cargar las transacciones.' : 'No se pudieron cargar las categorías.' }}</p>
        <button type="button" class="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500" @click="retryFailedLoads">Reintentar</button>
      </div>
      <p v-else-if="!transactions?.transactions?.length" class="text-gray-600">
        {{ transactionFilter ? 'No hay transacciones que coincidan con tu búsqueda.' : 'No hay transacciones en este período.' }}
      </p>

      <TransactionList
          v-else
          :transactions="searchSettings.showTransactionsByCategory ? transactions : paginatedTransactions"
          :transactions-by-category="searchSettings.showTransactionsByCategory ? paginatedCategories : transactionsByCategory"
          :search-settings="searchSettings"
          :wallet="selectedWallet"
          :categories="categories"
          :transaction-selected="transactionSelected"
          :show-edit="showEditTransactionSection"
          :saving="isUpdatingTransaction"
          @new="addTransaction"
          @edit="showEditTransaction"
          @delete="deleteTransaction"
          @update="updateTransaction"
          @cancel-edit="cancel"
      />

      <!-- PAGINACIÓN -->
      <Pagination
          v-if="!loading && !loadError && !loadingCategories && !categoriesError && totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          @change="currentPage = $event"
      />

    </div>
  </div>
</template>

<script setup>
import { blockInvalidChars, blockInvalidAmountInput, handleAmountPaste } from '@/utils/inputValidation'
import LoadingDots from '@/components/common/LoadingDots.vue'
import {ref, computed, watch, nextTick} from 'vue'
import { useLatestRequest } from '@/composables/useLatestRequest'
import moment from 'moment'
import Swal from 'sweetalert2'

import TransactionHeader from './TransactionHeader.vue'
import TransactionEditForm from './TransactionEditForm.vue'
import TransactionList from './TransactionList.vue'
import Pagination from './Pagination.vue'

import CategoryService from "../../services/category.service"
import TransactionService from "../../services/transaction.service"
import { exportToCSV } from '@/utils/exportCSV'
import { amountError, symbolError } from '@/utils/dataValidation'

const props = defineProps([
  'loading',
  'loadError',
  'transactions',
  'transactionsByCategory',
  'selectedWallet',
  'searchSettings'
])

const emit = defineEmits([
    'retry',
  'new-transaction',
  'new-crypto-transaction',
  'update-transaction',
  'update-crypto-transaction',
  'delete-transaction',
  'delete-crypto-transaction',
  'update-transaction-filter'
])

const categories = ref([])
const categoriesRequest = useLatestRequest()
const loadingCategories = categoriesRequest.loading
const categoriesError = categoriesRequest.error
const errorMessage = ref("")
const showIconNewTransaction = ref(true)

const isSavingTransaction = ref(false)
const isUpdatingTransaction = ref(false)

const transactionSelected = ref(null)
const showEditTransactionSection = ref(false)

const transactionList = ref(null)
const currentPage = ref(1)
const pageSize = 10

const newCryptoTransaction = ref({})
const cryptoAmountError = computed(() =>
  newCryptoTransaction.value.amount === undefined ? '' : amountError(newCryptoTransaction.value.amount, true)
)
/* =======================
   SEARCH
======================= */
const transactionFilter = ref("")

/* =======================
   CATEGORÍAS
======================= */
function retryFailedLoads() {
  if (props.loadError) emit('retry')
  if (categoriesError.value) getCategories()
}

function getCategories() {
  categories.value = []
  categoriesRequest.invalidate()
  if (props.selectedWallet.type === 'crypto') return
  const walletId = props.selectedWallet.id
  return categoriesRequest.run(() => CategoryService.getCategories(walletId), (response) => {
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
  if (isSavingTransaction.value) return
  if (props.selectedWallet.type === 'crypto') {
    errorMessage.value = symbolError(form.symbol)
    if (errorMessage.value || amountError(form.amount, true)) return
  }
  isSavingTransaction.value = true
  errorMessage.value = ''

  if (props.selectedWallet.type !== 'crypto') {
    const payload = {
      ...form,
      date: moment(form.date).format('YYYY-MM-DD')
    }

    TransactionService.saveTransaction(payload)
        .then(() => {
          cancelNewTransaction()
          transactionFilter.value = ""
          emit('new-transaction')
        })
        .catch(handleError)
        .finally(() => { isSavingTransaction.value = false })

  } else {
    const payload = {
      ...form,
      walletId: props.selectedWallet.id
    }
    TransactionService.saveCryptoTransaction(payload)
        .then(() => {
          cancelNewTransaction()
          transactionFilter.value = ""
          emit('new-crypto-transaction')
        })
        .catch(handleError)
        .finally(() => { isSavingTransaction.value = false })
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
  if (isUpdatingTransaction.value) return
  isUpdatingTransaction.value = true

  if (props.selectedWallet.type !== 'crypto') {
    transaction.date = moment(transaction.date).format('YYYY-MM-DD')

    TransactionService.updateTransaction(transaction)
        .then(() => {
          cancel()
          transactionFilter.value = ""
          emit('update-transaction')
        })
        .catch(error => Swal.fire({ title: "No se pudo editar la transacción", text: error.response?.data?.body?.message || "Inténtalo de nuevo.", icon: "error" }))
        .finally(() => { isUpdatingTransaction.value = false })

  } else {
    TransactionService.updateCryptoTransaction(transaction)
        .then(() => {
          cancel()
          transactionFilter.value = ""
          emit('update-crypto-transaction')
        })
        .catch(error => Swal.fire({ title: "No se pudo editar la transacción", text: error.response?.data?.body?.message || "Inténtalo de nuevo.", icon: "error" }))
        .finally(() => { isUpdatingTransaction.value = false })
  }
}

/* =======================
   ELIMINAR
======================= */
function deleteTransaction(transaction) {
  const isCrypto = props.selectedWallet.type === 'crypto'

  return Swal.fire({
    title: 'Eliminar transacción',
    text: '¿Seguro que deseas eliminar esta transacción?',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: () => !Swal.isLoading(),
    preConfirm: async () => {
      try {
        if (isCrypto) {
          await TransactionService.deleteCryptoTransaction(transaction.id)
        } else {
          await TransactionService.deleteTransaction(transaction.id)
        }
        return true
      } catch {
        Swal.showValidationMessage('No se pudo eliminar la transacción. Inténtalo de nuevo.')
        return false
      }
    },
  }).then((result) => {
    if (!result.isConfirmed) return
    transactionFilter.value = ""
    emit(isCrypto ? 'delete-crypto-transaction' : 'delete-transaction', transaction)
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
  exportToCSV(props.transactions?.transactions || [], 'transacciones.csv', props.selectedWallet)
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
watch(() => props.selectedWallet.id, () => {
  transactionFilter.value = ""
  currentPage.value = 1
  cancel()
  cancelNewTransaction()
  getCategories()
}, { immediate: true })

watch(transactionFilter, () => {
  currentPage.value = 1
  emit('update-transaction-filter', transactionFilter.value)
})

watch(() => props.searchSettings, () => {
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

// Evita quedar en una página fuera de rango
// Escoge el número más pequeño entre la página actual y el total de páginas.
watch(totalPages, (pages) => {
  currentPage.value = Math.max(1, Math.min(currentPage.value, pages))
})

</script>
