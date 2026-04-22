/**
 * Bloquea caracteres inválidos en inputs de tipo numérico.
 * Usar con @keydown="blockInvalidChars"
 */
export function blockInvalidChars(input) {
    // Bloquea caracteres inválidos incluyendo notación científica
    if (['e', 'E', '+', '-'].includes(input.key)) {
        input.preventDefault();
    }
    const navigationKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
    // Bloquea si ya tiene 9 dígitos
    if (input.target.value.length >= 9 && !navigationKeys.includes(input.key)) {
        input.preventDefault();
    }
}