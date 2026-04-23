import { ref, watch, onMounted, onUnmounted } from 'vue'
import TransactionService from '@/services/transaction.service'

export function useCharts(selectedWallet, transactions, transactionsByCategory) {

    const profitLoss = ref([])
    const totalByCategory = ref([])

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
    function getProfitLoss(walletId) {
        TransactionService.getProfitLoss(walletId)
            .then((response) => {
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
            })
            .catch(() => {
                profitLoss.value = []
            })
    }

    /* =======================
       TOTAL POR CATEGORÍA
    ======================= */
    function buildTotalByCategoryChart() {
        totalByCategory.value = []
        chartLabelsTotalByCategory.value = []
        chartDataTotalByCategory.value = []

        if (!transactions.value?.transactions?.length) return

        // Paso 1: agrupar por fecha-categoría-tipo
        const byDateCategory = transactions.value.transactions.reduce((acc, t) => {
            const key = `${t.date}-${t.categoryName}-${t.type}`
            if (!acc[key]) {
                acc[key] = { date: t.date, detail: t.categoryName, type: t.type, totalAmount: t.amount }
            } else {
                acc[key].totalAmount += t.amount
            }
            return acc
        }, {})

        // Paso 2: agrupar por categoría-tipo para armar las series del chart
        const byCategory = Object.values(byDateCategory).reduce((acc, t) => {
            const key = `${t.detail}-${t.type}`
            const label = `${t.detail} ${t.type === 'income' ? '(+)' : '(-)'}`

            if (!acc[key]) {
                acc[key] = { detail: label, transactions: [{ date: t.date, totalAmount: t.totalAmount }] }
            } else {
                const existing = acc[key].transactions.find((x) => x.date === t.date)
                if (existing) {
                    existing.totalAmount += t.totalAmount
                } else {
                    acc[key].transactions.push({ date: t.date, totalAmount: t.totalAmount })
                }
            }
            return acc
        }, {})

        totalByCategory.value = Object.values(byCategory)

        if (!totalByCategory.value.length) return

        // Toma la categoría con más entradas para usarla como serie principal
        const biggerCategory = totalByCategory.value.reduce((max, obj) =>
                obj.transactions.length > max.transactions.length ? obj : max,
            totalByCategory.value[0]
        )

        const labels = biggerCategory.transactions.map((t) => t.date.split('T')[0])
        const data   = biggerCategory.transactions.map((t) => +t.totalAmount.toFixed(2))

        chartLabelsTotalByCategory.value = labels
        chartDataTotalByCategory.value = [{
            label: biggerCategory.detail,
            data,
            fill: false,
            borderColor: '#109618'
        }]
    }

    /* =======================
       FULLSCREEN
    ======================= */
    function fullScreenChart(refId) {
        const elem = document.getElementById(refId)
        if (elem.requestFullscreen && !document.webkitIsFullScreen) {
            elem.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    function handleFullScreen(event) {
        const id = event.target.id
        const isFullScreen = document.webkitIsFullScreen

        fullScreenExpense.value        = isFullScreen && id === 'expenseChartContainer'
        fullScreenIncome.value         = isFullScreen && id === 'incomeChartContainer'
        fullScreenProfitLoss.value     = isFullScreen && id === 'profitLossContainer'
        fullScreenTotalByCategory.value = isFullScreen && id === 'totalByCategoryContainer'
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
    watch(transactionsByCategory, buildIncomeExpenseCharts, { deep: true })
    watch(transactions, buildTotalByCategoryChart, { deep: true })

    return {
        profitLoss,
        totalByCategory,

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