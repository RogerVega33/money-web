// Validaciones de entrada alineadas con el contrato del backend.
const badRequest = message => { throw new Error(message) }

function text(value, label, max, optional = false) {
    if (optional && (value === undefined || value === null)) return '';
    if (typeof value !== 'string') badRequest(`${label} debe ser texto.`);
    const normalized = value.trim();
    if (!optional && !normalized) badRequest(`${label} es obligatorio.`);
    if ([...normalized].length > max) badRequest(`${label} debe tener máximo ${max} caracteres.`);
    // El esquema actual usa utf8mb3: rechazar caracteres que no puede almacenar.
    if ([...normalized].some(char => char.codePointAt(0) > 0xffff)) badRequest(`${label} contiene caracteres no compatibles con la base de datos actual.`);
    return normalized;
}

function decimalText(value) {
    if (typeof value !== 'number') return value;
    if (!Number.isFinite(value)) return '';
    const str = String(value);
    if (!str.includes('e')) return str;
    const [mantissa, exponent] = str.split('e');
    const [whole, fraction = ''] = mantissa.split('.');
    const digits = whole + fraction;
    const point = whole.length + Number(exponent);
    if (point <= 0) return '0.' + '0'.repeat(-point) + digits;
    return point >= digits.length ? digits + '0'.repeat(point - digits.length) : digits.slice(0, point) + '.' + digits.slice(point);
}

function amount(value, crypto = false, allowZero = false) {
    const scale = crypto ? 10 : 2;
    const integerDigits = crypto ? 20 : 13;
    const str = decimalText(value);
    if (typeof str !== 'string' || str.length > 64 || !/^\d+(\.\d+)?$/.test(str)) {
        badRequest('El monto debe ser un número decimal válido y no negativo.');
    }
    let [whole, fraction = ''] = str.split('.');
    whole = whole.replace(/^0+(?=\d)/, '');
    if (fraction.length > scale) badRequest(`El monto admite máximo ${scale} decimales.`);
    if (whole.length > integerDigits) badRequest(`El monto supera el límite permitido (${integerDigits} dígitos enteros).`);
    if (!allowZero && !/[1-9]/.test(whole + fraction)) badRequest('El monto debe ser mayor que cero.');
    return whole + (fraction ? '.' + fraction : '');
}

function date(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) badRequest('La fecha debe tener el formato YYYY-MM-DD.');
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 ||
        day > new Date(Date.UTC(year, month, 0)).getUTCDate()) badRequest('La fecha no es válida.');
    return value;
}

function symbol(value) {
    const normalized = text(value, 'El símbolo', 10).toUpperCase();
    if (!/^[A-Z0-9]{1,10}$/.test(normalized)) badRequest('El símbolo solo admite letras y números (máximo 10).');
    return normalized;
}

// Normalizar el separador sin convertir a Number ni redondear.
export function normalizeAmount(value) {
    return typeof value === 'string' ? value.replace(',', '.') : value
}

export function amountError(value, crypto = false, allowZero = false) {
    try { amount(normalizeAmount(value), crypto, allowZero); return '' } catch (error) { return error.message }
}

export function textError(value, label = 'El nombre', max = 50, optional = false) {
    try { text(value, label, max, optional); return '' } catch (error) { return error.message }
}

export function dateError(value) {
    try { date(value); return '' } catch (error) { return error.message }
}

export function symbolError(value) {
    try { symbol(value); return '' } catch (error) { return error.message }
}
