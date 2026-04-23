<template>
  <div class="dashboard">
    <div class="container mx-auto flex flex-col lg:flex-row">

      <!-- Col 1: wallets y configuración -->
      <div class="lg:basis-1/3 p-1 lg:p-2">
        <div class="flex flex-col w-full">
          <Wallet
              :wallets="wallets"
              :show-form-new-wallet="showFormNewWallet"
              :show-form-edit-wallet="showFormEditWallet"
              @select-wallet="selectWallet"
              @add-wallet="addWallet"
              @hide-forms="hideForms"
              @edit-wallet="editWallet"
          />
          <SearchSettings
              v-if="selectedWallet && !showForm"
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
          <Summary
              :selected-wallet="selectedWallet"
              :transactions="transactions"
              :show-starting-amount="searchSettings.dateRangePicked === 'all'"
          />
          <div ref="incomeChartContainer" id="incomeChartContainer">
            <BarChart
                :labels="chartLabelsIncome"
                :values="chartDataIncome"
                :fullScreen="fullScreenIncome"
                :hideMoney="hideMoney"
                color="#1D9E75"
                title="Ingresos"
                @requestFullScreen="fullScreenChart('incomeChartContainer')"
            />
          </div>
          <div ref="expenseChartContainer" id="expenseChartContainer">
            <BarChart
                :labels="chartLabelsExpense"
                :values="chartDataExpense"
                :fullScreen="fullScreenExpense"
                :hideMoney="hideMoney"
                color="#D85A30"
                title="Gastos"
                @requestFullScreen="fullScreenChart('expenseChartContainer')"
            />
          </div>
          <div ref="profitLossContainer" id="profitLossContainer">
            <LineChart
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
          <EditWallet v-if="selectedWallet && showFormEditWallet" :selected-wallet="selectedWallet"/>
        </div>
      </div>

      <!-- Col 3: Transacciones -->
      <div class="lg:basis-1/3 p-1 lg:p-2">
        <Transactions
            v-if="selectedWallet && !showForm"
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
                  chartLabelsTotalByCategory.length > 1"
        >
          <LineChart
              :labels="chartLabelsTotalByCategory"
              :datasets="chartDataTotalByCategory"
              :fullScreen="fullScreenTotalByCategory"
              :hideMoney="hideMoney"
              :showAverage="true"
              title="Total por categoría"
              @requestFullScreen="fullScreenChart('totalByCategoryContainer')"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import store from '@/store'

import WalletService from '@/services/wallet.service'

import BarChart from '@/components/BarChart.vue'
import LineChart from '@/components/LineChart.vue'
import Wallet from '@/components/Wallet.vue'
import SearchSettings from '@/components/SearchSettings.vue'
import Summary from '@/components/Summary.vue'
import Transactions from '@/components/transactions/Transactions.vue'
import NewWallet from '@/components/NewWallet.vue'
import EditWallet from '@/components/EditWallet.vue'

import { useTransactions } from '@/composables/useTransactions'
import { useCharts } from '@/composables/useCharts'

/* =======================
   WALLETS
======================= */
const wallets = ref([])
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
  dateRangePicked: 'month',
  showTransactionsByCategory: true
})

async function getWallets() {
  await WalletService.getWallets()
      .then((response) => { wallets.value = response.data.body })
      .catch(() => { wallets.value = [] })
}

function selectWallet(wallet) {
  selectedWallet.value = wallet
  const { id } = wallet
  const { year, month } = searchSettings.value.dateSelected

  if (wallet.type === 'crypto') {
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

function walletSaved(value) {
  if (value) getWallets()
  showFormNewWallet.value = false
}

/* =======================
   COMPOSABLES
======================= */
const {
  transactions,
  transactionsByCategory,
  transactionFilter,
  getTransactions,
  getCryptoWalletTransactions,
  getAllFiatTransactions,
  getAllCryptoTransactions,
  updateTransactionFilter,
} = useTransactions(selectedWallet, searchSettings)

const {
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
} = useCharts(selectedWallet, transactions, transactionsByCategory)

/* =======================
   EVENTOS DE TRANSACCIONES
======================= */
function onTransactionChanged() { getWallets(); getAllFiatTransactions() }
function onCryptoTransactionChanged() { getWallets(); getAllCryptoTransactions() }

/* =======================
   WATCHERS
======================= */
watch(searchSettings, () => {
  if (!selectedWallet.value?.id) return
  const { year, month } = searchSettings.value.dateSelected
  getTransactions(selectedWallet.value.id, year, month + 1)
}, { deep: true })

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