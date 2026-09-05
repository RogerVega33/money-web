import { ref, watch } from 'vue'
import { useLatestRequest } from './useLatestRequest'
import TransactionService from '@/services/transaction.service'

export function useTransactions(selectedWallet, searchSettings) {

    const transactions = ref({ transactions: [] })
    const transactionsTemp = ref([])
    const transactionsByCategory = ref([])
    const transactionFilter = ref('')
    const request = useLatestRequest()

    function loadTransactions(load) {
        transactions.value = { transactions: [] }
        transactionsTemp.value = []
        transactionFilter.value = ''
        return request.run(load, (response) => {
            transactions.value = response.data.body
            transactionsTemp.value = [...response.data.body.transactions]
            filterTransactions()
        })
    }

    /* =======================
       OBTENER TRANSACCIONES
    ======================= */
    function getTransactions(walletId, year, month) {
        transactionFilter.value = ''

        let monthSelected = month
        let yearSelected = year

        if (searchSettings.value.dateRangePicked === 'year' ||
            searchSettings.value.dateRangePicked === 'all') monthSelected = null
        if (searchSettings.value.dateRangePicked === 'all') yearSelected = null

        return loadTransactions(() => TransactionService.getTransactions(walletId, yearSelected, monthSelected))
    }

    function getCryptoWalletTransactions(walletId) {
        return loadTransactions(() => TransactionService.getCryptoWalletTransactions(walletId))
    }

    function getAllFiatTransactions() {
        const { id } = selectedWallet.value
        const { year, month } = searchSettings.value.dateSelected
        getTransactions(id, year, month + 1)
    }

    function getAllCryptoTransactions() {
        getCryptoWalletTransactions(selectedWallet.value.id)
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
                (g) => g.categoryName === t.categoryName && g.type === t.type
            )

            if (!existing) {
                grouped.push({
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