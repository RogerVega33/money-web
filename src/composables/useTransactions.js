import { ref, watch } from 'vue'
import { useLatestRequest } from './useLatestRequest'
import TransactionService from '@/services/transaction.service'

export function useTransactions(selectedWallet, searchSettings) {

    const transactions = ref({ transactions: [] })
    const transactionsTemp = ref([])
    const transactionsByCategory = ref([])
    const transactionFilter = ref('')
    const request = useLatestRequest()

    function loadTransactions(load, background = false) {
        if (!background) {
            transactions.value = { transactions: [] }
            transactionsTemp.value = []
        }
        return request.run(load, (response) => {
            transactions.value = response.data.body
            transactionsTemp.value = [...response.data.body.transactions]
            filterTransactions()
        }, { background })
    }

    /* =======================
       OBTENER TRANSACCIONES
    ======================= */
    function getTransactions(walletId, year, month, background = false) {

        if (searchSettings.value.dateRangePicked === 'range') {
            const [start, end] = searchSettings.value.monthRange
            const format = date => `${date.year}-${String(Number(date.month) + 1).padStart(2, '0')}`
            return loadTransactions(() => TransactionService.getTransactions(walletId, null, null, format(start), format(end)), background)
        }

        let monthSelected = month
        let yearSelected = year

        if (searchSettings.value.dateRangePicked === 'year' ||
            searchSettings.value.dateRangePicked === 'all') monthSelected = null
        if (searchSettings.value.dateRangePicked === 'all') yearSelected = null

        return loadTransactions(() => TransactionService.getTransactions(walletId, yearSelected, monthSelected), background)
    }

    function getCryptoWalletTransactions(walletId, background = false, refreshPrices = true) {
        return loadTransactions(() => TransactionService.getCryptoWalletTransactions(walletId, refreshPrices), background)
    }

    function getAllFiatTransactions(background = false) {
        const { id } = selectedWallet.value
        const { year, month } = searchSettings.value.dateSelected
        return getTransactions(id, year, month + 1, background)
    }

    function getAllCryptoTransactions(background = false, refreshPrices = true) {
        return getCryptoWalletTransactions(selectedWallet.value.id, background, refreshPrices)
    }

    /* =======================
       FILTRO
    ======================= */
    function updateTransactionFilter(val) {
        transactionFilter.value = val
    }

    function filterTransactions() {
        const val = transactionFilter.value.toLowerCase()

        transactions.value.transactions = transactionsTemp.value.filter((t) => {
            const detail = t.detail?.toLowerCase() ?? ''
            const category = t.categoryName?.toLowerCase() ?? ''
            const symbol = t.symbol?.toLowerCase() ?? ''
            return !val || detail.includes(val) || category.includes(val) || symbol.includes(val)
        })
    }

    /* =======================
       AGRUPAMIENTO
    ======================= */
    function groupTransactionsByCategory() {
        if (!transactions.value?.transactions) return []

        const grouped = []

        transactions.value.transactions.forEach((t) => {
            const existing = grouped.find(
                (g) => g.categoryId === t.categoryId
            )

            if (!existing) {
                grouped.push({
                    categoryId: t.categoryId,
                    categoryName: t.categoryName,
                    type: t.type,
                    total: t.amount,
                    transactions: [t],
                    showDetail: false
                })
            } else {
                existing.total += t.amount
                existing.transactions.push(t)
            }
        })

        return grouped
    }

    /* =======================
       WATCHERS
    ======================= */
    watch(
        transactions,
        () => {
            transactionsByCategory.value = groupTransactionsByCategory()
        },
        { deep: true }
    )

    watch(transactionFilter, filterTransactions)

    return {
        loadingTransactions: request.loading,
        transactionsError: request.error,
        transactions,
        transactionsTemp,
        transactionsByCategory,
        transactionFilter,

        getTransactions,
        getCryptoWalletTransactions,
        getAllFiatTransactions,
        getAllCryptoTransactions,
        updateTransactionFilter,
    }
}
