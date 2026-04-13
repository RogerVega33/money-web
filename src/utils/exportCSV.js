export function exportToCSV(transactions, filename = 'transacciones.csv') {
    const escapeField = (value) => {
        const str = String(value)
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
    }

    const formatDate = (dateStr) => {

        const [year, month, day] = dateStr.split('T')[0].split('-')
        return `${day}/${month}/${year}`
    }

    const headers = ['Billetera', 'Fecha', 'Categoría', 'Tipo', 'Monto', 'Detalle']

    const rows = transactions.map(t => [
        t.walletName,
        formatDate(t.date),
        t.categoryName,
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        t.type === 'income' ? Number(t.amount).toFixed(2) : -Number(t.amount).toFixed(2),
        escapeField(t.detail)
    ])

    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
}