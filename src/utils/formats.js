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