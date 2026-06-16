import type { DbEvent } from '@/lib/queries/events';

export type StatusVariant = 'red' | 'green' | 'gray';

export interface EventStatusInfo {
  label: string;
  variant: StatusVariant;
  isPast: boolean;
}

/**
 * Calcula el status visual de un evento según sus datos:
 * - Si es pasado → "Finalizado" en gris
 * - Si es próximo y es pago → "Entradas" en verde
 * - Si es próximo y es gratis → "Inscripción abierta" en rojo
 */
export function getEventStatus(event: DbEvent): EventStatusInfo {
  const today = new Date().toISOString().split('T')[0];
  const isPast = event.date < today;

  if (isPast) {
    return { label: 'Finalizado', variant: 'gray', isPast: true };
  }

  if (event.is_paid && event.ticket_url) {
    return { label: 'Entradas', variant: 'green', isPast: false };
  }

  return { label: 'Inscripción abierta', variant: 'red', isPast: false };
}