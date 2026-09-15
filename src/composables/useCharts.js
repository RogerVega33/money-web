import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useLatestRequest } from './useLatestRequest'
import TransactionService from '@/services/transaction.service'

export function useCharts(selectedWallet, transactions, transactionsByCategory, transactionFilter) {

    const profitLoss = ref([])
    const historyRequest = useLatestRequest()
    const totalByCategory = ref([])
    const selectedCategoryId = ref(null)
    const categoryChartIndex = computed(() => totalByCategory.value.findIndex(c => c.id === selectedCategoryId.value))
    const categoryChartCount = computed(() => totalByCategory.value.length)
    const categoryChartName = computed(() => totalByCategory.value[categoryChartIndex.value]?.detail ?? '')
    function changeChartCategory(offset) {
        const category = totalByCategory.value[categoryChartIndex.value + offset]
        if (!category) return
        selectedCategoryId.value = category.id
        renderCategoryChart()
    }

    const chartLabelsExpense = ref([])
    const chartLabelsIncome = ref([])
    const chartLabelsProfitLoss = ref([])
    const chartLabelsTotalByCategory = ref([])

    const chartDataExpense = ref([])
    const chartDataIncome = ref([])
    const chartDataProfitLoss = ref([])
    const chartDataTotalByCategory = ref([])

    const fullScreenIncome = ref(false)
    const fullScreenExpense = ref(false)
    const fullScreenProfitLoss = ref(false)
    const fullScreenTotalByCategory = ref(false)

    /* =======================
       INCOME / EXPENSE CHARTS
       Se alimenta desde transactionsByCategory
    ======================= */
    function buildIncomeExpenseCharts() {
        chartLabelsExpense.value = []
        chartDataExpense.value = []
        chartLabelsIncome.value = []
        chartDataIncome.value = []

        transactionsByCategory.value.forEach((group) => {
            if (group.type === 'expense') {
                chartLabelsExpense.value.push(group.categoryName)
                chartDataExpense.value.push(group.total)
            } else if (group.type === 'income') {
                chartLabelsIncome.value.push(group.categoryName)
                chartDataIncome.value.push(group.total)
            }
        })
    }

    /* =======================
       PROFIT / LOSS CHART
    ======================= */
    function getProfitLoss(walletId, background = false) {
        if (!background || !walletId) {
            historyRequest.invalidate()
            profitLoss.value = []
            chartLabelsProfitLoss.value = []
            chartDataProfitLoss.value = []
        }
        if (!walletId) return

        return historyRequest.run(() => TransactionService.getProfitLoss(walletId), (response) => {
                profitLoss.value = response.data.body.profitLoss

                chartLabelsProfitLoss.value = []
                chartDataProfitLoss.value = []

                const income  = { label: 'Ingresos', data: [], fill: false, borderColor: '#109618' }
                const expense = { label: 'Gastos',   data: [], fill: false, borderColor: '#dc3912' }
                const savings = { label: 'Ahorros',  data: [], fill: false, borderColor: '#ff9900' }
                const total   = { label: 'Total',    data: [], fill: false, borderColor: '#3366cc' }

                profitLoss.value.forEach((pl) => {
                    chartLabelsProfitLoss.value.push(pl.date.split('T')[0])
                    income.data.push(pl.income)
                    expense.data.push(pl.expense)
                    savings.data.push(pl.savings)
                    total.data.push(pl.total)
                })

                chartDataProfitLoss.value.push(income, expense, savings, total)
            }, { background })
    }

    /* =======================
       TOTAL POR CATEGORÍA
    ======================= */
    function buildTotalByCategoryChart() {
        totalByCategory.value = []
        chartLabelsTotalByCategory.value = []
        chartDataTotalByCategory.value = []

        if (!transactions.value?.transactions?.length) return

        // El orden proviene de la misma lista de resultados.
        totalByCategory.value = transactionsByCategory.value.map(group => {
            const months = new Map()
            for (const t of group.transactions) {
                const month = `${t.date.slice(0, 7)}-01`
                months.set(month, (months.get(month) ?? 0) + t.amount)
            }
            return {
                id: group.categoryId,
                detail: `${group.categoryName} (${group.type === 'income' ? 'ingreso' : 'gasto'})`,
                transactions: [...months].map(([date, totalAmount]) => ({ date, totalAmount })),
            }
        })
        if (!totalByCategory.value.some(c => c.id === selectedCategoryId.value)) {
            selectedCategoryId.value = totalByCategory.value[0]?.id ?? null
        }
        renderCategoryChart()
    }

    function renderCategoryChart() {
        chartLabelsTotalByCategory.value = []
        chartDataTotalByCategory.value = []
        const category = totalByCategory.value[categoryChartIndex.value]
        if (!category) return
        const monthlyTotals = [...category.transactions].sort((a, b) => a.date.localeCompare(b.date))
        const monthIndex = date => {
            const [year, month] = date.split('-').map(Number)
            return year * 12 + month - 1
        }
        const amounts = new Map(monthlyTotals.map(t => [monthIndex(t.date), t.totalAmount]))
        const labels = []
        const data = []
        const lastMonth = monthIndex(monthlyTotals[monthlyTotals.length - 1].date)
        for (let month = monthIndex(monthlyTotals[0].date); month <= lastMonth; month++) {
            labels.push(`${Math.floor(month / 12)}-${String(month % 12 + 1).padStart(2, '0')}-01`)
            data.push(+(amounts.get(month) ?? 0).toFixed(2))
        }

        chartLabelsTotalByCategory.value = labels
        chartDataTotalByCategory.value = [{
            label: category.detail,
            data,
            fill: false,
            borderColor: '#109618'
        }]
    }

    /* =======================
       FULLSCREEN
    ======================= */
    let fullscreenPending = false
    async function fullScreenChart(refId) {
        if (fullscreenPending) return
        const elem = document.getElementById(refId)
        if (!elem) return
        fullscreenPending = true
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            } else if (elem.requestFullscreen) {
                await elem.requestFullscreen()
            }
        } catch {
            // Si el navegador rechaza la solicitud, conservar el estado real.
        } finally {
            handleFullScreen()
            fullscreenPending = false
        }
    }

    function handleFullScreen() {
        const id = document.fullscreenElement?.id
        fullScreenExpense.value = id === 'expenseChartContainer'
        fullScreenIncome.value = id === 'incomeChartContainer'
        fullScreenProfitLoss.value = id === 'profitLossContainer'
        fullScreenTotalByCategory.value = id === 'totalByCategoryContainer'
    }

    /* =======================
       LIFECYCLE
    ======================= */
    onMounted(() => {
        document.addEventListener('fullscreenchange', handleFullScreen)
    })

    onUnmounted(() => {
        document.removeEventListener('fullscreenchange', handleFullScreen)
    })

    /* =======================
       WATCHERS
    ======================= */
    watch(transactionsByCategory, () => {
        if (selectedWallet.value?.type === 'crypto') return
        buildIncomeExpenseCharts()
    }, { deep: true })

    watch([transactionsByCategory, transactionFilter, () => selectedWallet.value?.id],
        (current, previous) => {
            if (current[1] !== previous[1] || current[2] !== previous[2]) selectedCategoryId.value = null
            if (selectedWallet.value?.type === 'crypto') return
            buildTotalByCategoryChart()
        }, { deep: true })

    return {
        loadingHistory: historyRequest.loading,
        historyError: historyRequest.error,
        profitLoss,
        totalByCategory,
        categoryChartIndex, categoryChartCount, categoryChartName, changeChartCategory,

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
    }
}
