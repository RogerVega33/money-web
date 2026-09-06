import store from '../store'

export function formatCurrency(value) {
    value = +value;
    if (typeof value !== 'number') {
        return value;
    }
    if (store.state.app.hideMoney) {
        return "$****";
    }
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    return formatter.format(value);
}

export function formatCryptoHoldings(value){
    if (store.state.app.hideMoney) {
        return "****";
    }
    return Number(value || 0).toFixed(6);
}

export function formatDateTime(dateTime) {
    return new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(new Date(dateTime));
}