// Permite estados intermedios como "" o "12." mientras se escribe.
// La validación del formulario y del backend comprueba el monto definitivo.
function validInsertion(input, text) {
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? start
    const value = input.value.slice(0, start) + text + input.value.slice(end)
    const maxLength = input.maxLength > 0 ? input.maxLength : 13
    return value.length <= maxLength && /^\d*([.,]\d*)?$/.test(value)
}

export function blockInvalidChars(event) {
    // Mantener selección, copiar, pegar y deshacer mediante atajos.
    if (event.ctrlKey || event.metaKey) return
    if (event.key.length === 1 && !validInsertion(event.target, event.key)) {
        event.preventDefault()
    }
}

// También cubre teclados móviles que no generan keydown para cada carácter.
export function blockInvalidAmountInput(event) {
    if (event.data && !validInsertion(event.target, event.data)) event.preventDefault()
}

export function handleAmountPaste(event) {
    event.preventDefault()
    const input = event.target
    if (input.disabled || input.readOnly) return
    const text = event.clipboardData.getData('text').trim().replace(',', '.')
    if (!text || !validInsertion(input, text)) return
    input.setRangeText(text, input.selectionStart, input.selectionEnd, 'end')
    const InputEvent = input.ownerDocument.defaultView.Event
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
}
