const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/**
 * Formatea una fecha YYYY-MM-DD a "Sáb 14 jun"
 */
export function formatEventDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Importante: usar UTC para evitar shifts de timezone
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayName = dayNames[date.getUTCDay()];
  const monthName = monthNames[date.getUTCMonth()];
  return `${dayName} ${day.toString().padStart(2, '0')} ${monthName}`;
}

/**
 * Formatea una hora HH:MM:SS a "15:00 hs"
 */
export function formatEventTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes} hs`;
}

/**
 * Formatea fecha larga para detalle: "Sábado 14 de junio de 2025"
 */
export function formatLongDate(dateStr: string): string {
  const fullDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const fullMonthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${fullDayNames[date.getUTCDay()]} ${day} de ${fullMonthNames[date.getUTCMonth()]} de ${year}`;
}

/**
 * Devuelve { day: "31 may", year: "2025" } a partir de una fecha YYYY-MM-DD
 */
export function formatArchiveDate(dateStr: string): { day: string; year: string } {
  const [year, month, dayNum] = dateStr.split('-').map(Number);
  return {
    day: `${dayNum.toString().padStart(2, '0')} ${monthNames[month - 1]}`,
    year: year.toString(),
  };
}