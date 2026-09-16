<template>
  <div class="dashboard">
    <p
        v-if="!realtimeConnected"
        class="pointer-events-none fixed bottom-0 right-0 z-50 m-0 rounded-tl-lg bg-white px-3 py-2 text-sm text-gray-500 shadow-lg"
        role="status"
    >Conectando <LoadingDots /></p>
    <div class="container mx-auto flex flex-col lg:flex-row">

      <!-- Col 1: wallets y configuración -->
      <div class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <Wallet
              :wallets="visibleWallets"
              :selected-wallet="selectedWallet"
              :has-archived-wallets="wallets.some(wallet => wallet.isArchived)"
              :loading="loadingWallets"
              :load-error="walletsError"
              :show-form-new-wallet="showFormNewWallet"
              :show-form-edit-wallet="showFormEditWallet"
              @retry="getWallets"
              @select-wallet="selectWallet"
              @add-wallet="addWallet"
              @hide-forms="hideForms"
              @edit-wallet="editWallet"
          />
          <SearchSettings
              :settings="searchSettings"
              v-if="!showForm"
              v-model:showArchivedWallets="showArchivedWallets"
              :selected-wallet="selectedWallet"
              @change-search-settings="changeSearchSettings"
          />
        </div>
      </div>

      <!-- Col 2: Resumen y charts -->
      <div
          v-if="selectedWallet && selectedWallet.type !== 'crypto' && !showForm"
          class="lg:basis-1/3 p-1 lg:p-2"
      >
        <div class="flex flex-col w-full">
          <p v-if="loadingTransactions" class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8 text-gray-600" role="status">Cargando movimientos<LoadingDots /></p>
          <div v-else-if="transactionsError" class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8 text-gray-600" role="alert"><p>No se pudieron cargar los movimientos.</p><button type="button" class="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500" @click="retryTransactions">Reintentar</button></div>
          <Summary
              v-else
              :title="summaryTitle"
              :navigation-unit="summaryNavigationUnit"
              :can-previous="canShiftSummaryPeriod(-1)"
              :can-next="canShiftSummaryPeriod(1)"
              :empty="!transactionsTemp.length"
              @change-period="shiftSummaryPeriod"
              :selected-wallet="selectedWallet"
              :transactions="transactions"
              :show-starting-amount="searchSettings.dateRangePicked === 'all'"
          />
          <div v-show="!loadingTransactions && !transactionsError && transactionsTemp.length > 0" ref="incomeChartContainer" id="incomeChartContainer">
            <BarChart
                :labels="chartLabelsIncome"
                :values="chartDataIncome"
                :fullScreen="fullScreenIncome"
                :hideMoney="hideMoney"
                color="#1D9E75"
                :title="transactionFilter ? 'Ingresos (búsqueda)' : 'Ingresos'"
                @requestFullScreen="fullScreenChart('incomeChartContainer')"
            />
          </div>
          <div v-show="!loadingTransactions && !transactionsError && transactionsTemp.length > 0" ref="expenseChartContainer" id="expenseChartContainer">
            <BarChart
                :labels="chartLabelsExpense"
                :values="chartDataExpense"
                :fullScreen="fullScreenExpense"
                :hideMoney="hideMoney"
                color="#D85A30"
                :title="transactionFilter ? 'Gastos (búsqueda)' : 'Gastos'"
                @requestFullScreen="fullScreenChart('expenseChartContainer')"
            />
          </div>
          <div ref="profitLossContainer" id="profitLossContainer">
            <p v-if="loadingHistory" class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8 text-gray-600" role="status">Cargando histórico<LoadingDots /></p>
            <div v-else-if="historyError" class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8 text-gray-600" role="alert"><p>No se pudo cargar el histórico.</p><button type="button" class="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500" @click="getProfitLoss(selectedWallet.id)">Reintentar</button></div>
            <p v-else-if="!chartLabelsProfitLoss.length" class="w-full card mx-auto p-4 max-w-md bg-white rounded-lg border shadow-md sm:p-8 text-gray-600">Todavía no hay movimientos en el histórico de esta billetera.</p>
            <LineChart
                v-else
                :labels="chartLabelsProfitLoss"
                :datasets="chartDataProfitLoss"
                :fullScreen="fullScreenProfitLoss"
                :hideMoney="hideMoney"
                title="Histórico"
                @requestFullScreen="fullScreenChart('profitLossContainer')"
            />
          </div>
        </div>
      </div>

      <!-- Col 2: wallet forms -->
      <div v-if="showForm" class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <NewWallet v-if="showFormNewWallet" @success="walletSaved"/>
          <EditWallet v-if="selectedWallet && showFormEditWallet" :selected-wallet="selectedWallet" @success="walletUpdated"/>
        </div>
      </div>

      <!-- Col 3: Transacciones -->
      <div class="lg:basis-1/3 p-1 lg:p-2">
        <Transactions
            v-if="selectedWallet && !showForm"
            @retry="retryTransactions"
            :loading="loadingTransactions"
            :load-error="transactionsError"
            :search-settings="searchSettings"
            :transactions-by-category="transactionsByCategory"
            :transactions="transactions"
            :selected-wallet="selectedWallet"
            @new-transaction="onTransactionChanged"
            @update-transaction="onTransactionChanged"
            @delete-transaction="onTransactionChanged"
            @new-crypto-transaction="onCryptoTransactionChanged"
            @update-crypto-transaction="onCryptoTransactionChanged"
            @delete-crypto-transaction="onCryptoTransactionChanged"
            @update-transaction-filter="updateTransactionFilter"
        />
        <div
            ref="totalByCategoryContainer"
            id="totalByCategoryContainer"
            v-if="selectedWallet &&
                  selectedWallet.type !== 'crypto' &&
                  transactionFilter &&
                  chartLabelsTotalByCategory.length > 0"
        >
          <LineChart
              :labels="chartLabelsTotalByCategory"
              :datasets="chartDataTotalByCategory"
              :fullScreen="fullScreenTotalByCategory"
              :hideMoney="hideMoney"
              :showAverage="true"
              :showLegend="false"
              title="Total por categoría"
              @requestFullScreen="fullScreenChart('totalByCategoryContainer')"
          >
            <template #navigation>
              <div class="flex items-center gap-3">
                <button v-if="categoryChartCount > 1" type="button" aria-label="Categoría anterior"
                        :disabled="categoryChartIndex === 0" @click="changeChartCategory(-1)"
                        class="shrink-0 rounded px-3 py-2 text-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
                <div class="flex-1 min-w-0 text-center" aria-live="polite">
                  <p class="font-medium text-gray-900 break-words">{{ categoryChartName }}</p>
                  <p v-if="categoryChartCount > 1" class="text-sm text-gray-500">{{ categoryChartIndex + 1 }} de {{ categoryChartCount }}</p>
                </div>
                <button v-if="categoryChartCount > 1" type="button" aria-label="Categoría siguiente"
                        :disabled="categoryChartIndex >= categoryChartCount - 1" @click="changeChartCategory(1)"
                        class="shrink-0 rounded px-3 py-2 text-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">›</button>
              </div>
            </template>
          </LineChart>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import LoadingDots from '@/components/common/LoadingDots.vue'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import store from '@/store'
import { isCalendarYear } from '@/config/calendar'

import WalletService from '@/services/wallet.service'

import BarChart from '@/components/BarChart.vue'
import LineChart from '@/components/LineChart.vue'
import Wallet from '@/components/Wallet.vue'
import SearchSettings from '@/components/SearchSettings.vue'
import Summary from '@/components/Summary.vue'
import Transactions from '@/components/transactions/Transactions.vue'
import NewWallet from '@/components/NewWallet.vue'
import EditWallet from '@/components/EditWallet.vue'

import { useLatestRequest } from '@/composables/useLatestRequest'
import { useTransactions } from '@/composables/useTransactions'
import { useCharts } from '@/composables/useCharts'
import { useRealtime } from '@/composables/useRealtime'

/* =======================
   WALLETS
======================= */
const wallets = ref([])
const showArchivedWallets = ref(false)
const visibleWallets = computed(() => wallets.value.filter(wallet => showArchivedWallets.value || !wallet.isArchived))
const walletsRequest = useLatestRequest()
const loadingWallets = walletsRequest.loading
const walletsError = walletsRequest.error
const selectedWallet = ref(null)
const showFormNewWallet = ref(false)
const showFormEditWallet = ref(false)

const showForm = computed(() => showFormNewWallet.value || showFormEditWallet.value)

const hideMoney = ref(store.state.app.hideMoney)

const searchSettings = ref({
  dateSelected: {
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  },
  monthRange: [
    { month: new Date().getMonth(), year: new Date().getFullYear() - 1 },
    { month: new Date().getMonth(), year: new Date().getFullYear() },
  ],
  dateRangePicked: 'month',
  showTransactionsByCategory: true
})

const summaryNavigationUnit = computed(() =>
  searchSettings.value.dateRangePicked === 'month' ? 'Mes' :
    searchSettings.value.dateRangePicked === 'year' ? 'Año' : ''
)

function shiftedSummaryDate(direction) {
  if (![-1, 1].includes(direction) || !summaryNavigationUnit.value) return null
  const { year, month } = searchSettings.value.dateSelected
  const index = Number(year) * 12 + Number(month) +
    (searchSettings.value.dateRangePicked === 'year' ? direction * 12 : direction)
  const nextYear = Math.floor(index / 12)
  if (!isCalendarYear(nextYear)) return null
  return { year: nextYear, month: index % 12 }
}

function canShiftSummaryPeriod(direction) {
  return shiftedSummaryDate(direction) !== null
}

function shiftSummaryPeriod(direction) {
  const date = shiftedSummaryDate(direction)
  if (date) searchSettings.value.dateSelected = date
}

const summaryTitle = computed(() => {
  const { dateRangePicked, dateSelected } = searchSettings.value
  if (dateRangePicked === 'all') return 'Resumen histórico'
  if (dateRangePicked === 'range') {
    const format = date => `${String(Number(date.month) + 1).padStart(2, '0')}/${date.year}`
    return `Resumen ${searchSettings.value.monthRange.map(format).join(' - ')}`
  }
  if (dateRangePicked === 'year') return `Resumen ${dateSelected.year}`
  return `Resumen ${String(dateSelected.month + 1).padStart(2, '0')}/${dateSelected.year}`
})

function getWallets(background = false, refreshPrices = true) {
  return walletsRequest.run(() => WalletService.getWallets(refreshPrices), (response) => {
    wallets.value = response.data.body
    if (selectedWallet.value) {
      selectedWallet.value = wallets.value.find(wallet => wallet.id === selectedWallet.value.id) || null
    }
  }, { background: background === true })
}

watch(visibleWallets, (visible) => {
  if (selectedWallet.value && !visible.some(wallet => wallet.id === selectedWallet.value.id)) {
    selectedWallet.value = null
    showFormEditWallet.value = false
  }
})

function selectWallet(wallet) {
  selectedWallet.value = wallet
  const { id } = wallet
  const { year, month } = searchSettings.value.dateSelected

  if (wallet.type === 'crypto') {
    getProfitLoss(null)
    getCryptoWalletTransactions(id)
  } else {
    getTransactions(id, year, month + 1)
    getProfitLoss(id)
  }
}

function addWallet() { showFormNewWallet.value = true }
function hideForms() { showFormNewWallet.value = false; showFormEditWallet.value = false }
function editWallet() { showFormEditWallet.value = true }
function changeSearchSettings(val) { searchSettings.value = val }

async function walletUpdated(wallet) {
  await getWallets()
  if (!disposed && wallet.type === 'fiat' && selectedWallet.value?.id === wallet.id) {
    await getProfitLoss(wallet.id)
  }
}

function walletSaved(value) {
  if (value) getWallets()
  showFormNewWallet.value = false
}

/* =======================
   COMPOSABLES
======================= */
const {
  loadingTransactions,
  transactionsError,
  transactions,
  transactionsTemp,
  transactionsByCategory,
  transactionFilter,
  getTransactions,
  getCryptoWalletTransactions,
  getAllFiatTransactions,
  getAllCryptoTransactions,
  updateTransactionFilter,
} = useTransactions(selectedWallet, searchSettings)

const {
  categoryChartIndex, categoryChartCount, categoryChartName, changeChartCategory,
  loadingHistory,
  historyError,
  chartLabelsExpense,
  chartLabelsIncome,
  chartLabelsProfitLoss,
  chartLabelsTotalByCategory,
  chartDataExpense,
  chartDataIncome,
  chartDataProfitLoss,
  chartDataTotalByCategory,
  fullScreenIncome,
  fullScreenExpense,
  fullScreenProfitLoss,
  fullScreenTotalByCategory,
  getProfitLoss,
  fullScreenChart,
} = useCharts(selectedWallet, transactions, transactionsByCategory, transactionFilter)

/* =======================
   EVENTOS DE TRANSACCIONES
======================= */
function retryTransactions() {
  if (selectedWallet.value?.type === 'crypto') getAllCryptoTransactions()
  else if (selectedWallet.value?.id) getAllFiatTransactions()
}

let refreshTimer
let refreshing = false
let refreshPending = false
let disposed = false

async function refreshData() {
  refreshTimer = null
  if (refreshing) { refreshPending = true; return }
  refreshing = true
  try {
    const requests = [getWallets(true)]
    if (selectedWallet.value?.id) {
      if (selectedWallet.value.type === 'crypto') requests.push(getAllCryptoTransactions(true))
      else requests.push(getAllFiatTransactions(true), getProfitLoss(selectedWallet.value.id, true))
    }
    await Promise.all(requests)
  } finally {
    refreshing = false
    if (refreshPending && !disposed) {
      refreshPending = false
      onTransactionChanged()
    }
  }
}

function onTransactionChanged() {
  if (disposed) return
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(refreshData, 150)
}
function onCryptoTransactionChanged() { onTransactionChanged() }
let pricesTimer
let refreshingPrices = false
let pricesPending = false
async function refreshPrices() {
  pricesTimer = null
  if (disposed) return
  if (refreshingPrices) { pricesPending = true; return }
  refreshingPrices = true
  try {
    // Solo leer precios guardados: este evento no debe volver a consultar Binance.
    const requests = [getWallets(true, false)]
    if (selectedWallet.value?.type === 'crypto') requests.push(getAllCryptoTransactions(true, false))
    await Promise.all(requests)
  } finally {
    refreshingPrices = false
    if (pricesPending && !disposed) {
      pricesPending = false
      onPricesUpdated()
    }
  }
}
function onPricesUpdated() {
  if (disposed) return
  clearTimeout(pricesTimer)
  pricesTimer = setTimeout(refreshPrices, 150)
}
const { connected: realtimeConnected } = useRealtime(onTransactionChanged, onPricesUpdated)
onUnmounted(() => { disposed = true; clearTimeout(refreshTimer); clearTimeout(pricesTimer) })

/* =======================
   WATCHERS
======================= */
// Comparar solo los valores que afectan a la consulta, no la presentación.
const transactionPeriod = computed(() => {
  const { dateRangePicked, dateSelected, monthRange } = searchSettings.value
  if (dateRangePicked === 'all') return 'all'
  if (dateRangePicked === 'range') {
    return `range:${monthRange.map(date => `${date.year}-${date.month}`).join(':')}`
  }
  if (dateRangePicked === 'year') return `year:${dateSelected.year}`
  return `month:${dateSelected.year}-${dateSelected.month}`
})

watch(transactionPeriod, () => {
  if (!selectedWallet.value?.id || selectedWallet.value.type === 'crypto') return
  const { year, month } = searchSettings.value.dateSelected
  getTransactions(selectedWallet.value.id, year, month + 1)
})

watch(() => store.state.app.hideMoney, (val) => {
  hideMoney.value = val
})

/* =======================
   LIFECYCLE
======================= */
onMounted(getWallets)
</script>

<style src="@vueform/multiselect/themes/default.css"></style>

<style>
.card {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
