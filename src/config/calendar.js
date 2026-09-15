// Límites compartidos por los calendarios, sus validaciones y la navegación del Resumen.
export const MIN_CALENDAR_YEAR = 2000
export const FUTURE_CALENDAR_YEARS = 1

const maxYear = new Date().getFullYear() + FUTURE_CALENDAR_YEARS

export const calendarProps = {
  yearRange: [MIN_CALENDAR_YEAR, maxYear],
  minDate: new Date(MIN_CALENDAR_YEAR, 0, 1),
  maxDate: new Date(maxYear, 11, 31),
  preventMinMaxNavigation: true,
}

export function isCalendarYear(value) {
  return value !== null && value !== undefined && value !== '' &&
    Number.isInteger(Number(value)) && Number(value) >= MIN_CALENDAR_YEAR && Number(value) <= maxYear
}
