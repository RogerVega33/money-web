import { helpers } from '@vuelidate/validators'

// Validador para Vuelidate
export const strongPassword = helpers.withParams({}, (value) => {
    if (!value) return true
    const hasUpper  = /[A-Z]/.test(value)
    const hasLower  = /[a-z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    return (value.length >= 8 && hasUpper && hasLower && hasNumber) || value.length >= 12
})

// Barra de fortaleza visual
export const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '' }

    const hasLower  = /[a-z]/.test(password)
    const hasUpper  = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^a-zA-Z0-9]/.test(password)

    let charsetSize = 0
    if (hasLower)  charsetSize += 26
    if (hasUpper)  charsetSize += 26
    if (hasNumber) charsetSize += 10
    if (hasSymbol) charsetSize += 32

    const entropy = password.length * Math.log2(charsetSize || 1)

    if (entropy < 28) return { level: 1, label: 'Contraseña muy débil' }
    if (entropy < 36) return { level: 2, label: 'Contraseña débil' }
    if (entropy < 50) return { level: 3, label: 'Contraseña aceptable' }
    if (entropy < 65) return { level: 4, label: 'Contraseña fuerte' }
    return { level: 5, label: 'Contraseña muy fuerte' }
}

// Colores por nivel (para usar con strengthColor)
export const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d']