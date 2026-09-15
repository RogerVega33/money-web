// El formato cambia las etiquetas, no el dominio automático de Chart.js.
export function formatCurrencyTick(value, index, ticks = []) {
    const amount = Number(value)
    if (!Number.isFinite(amount)) return ''
    const magnitude = Math.abs(amount)
    const unit = magnitude >= 1000000 ? 1000000 : magnitude >= 1000 ? 1000 : 1
    const suffix = unit === 1000000 ? 'M' : unit === 1000 ? 'k' : ''
    const steps = ticks.slice(1).map((tick, i) => Math.abs(Number(tick.value) - Number(ticks[i].value)))
        .filter(step => Number.isFinite(step) && step > 0)
    // Conservar suficiente precisión para distinguir marcas cercanas del eje.
    const step = steps.length ? Math.min(...steps) / unit : 1
    const precision = Math.min(8, Math.max(unit === 1 ? 2 : 1, Math.ceil(-Math.log10(step))))
    return '$' + (amount / unit).toLocaleString('en-US', { maximumFractionDigits: precision }) + suffix
}
