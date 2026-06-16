import { createClient } from '@/lib/supabase/server';

export interface DbEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location_name: string | null;
  address: string | null;
  image_url: string | null;
  is_paid: boolean;
  price: number | null;
  ticket_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene los próximos eventos publicados, ordenados por fecha ascendente.
 * @param limit - Cantidad máxima de eventos a retornar (default: 3)
 */
export async function getUpcomingEvents(limit = 3): Promise<DbEvent[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene todos los eventos publicados próximos.
 */
export async function getAllUpcomingEvents(): Promise<DbEvent[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene los eventos pasados publicados, ordenados de más reciente a más viejo.
 */
export async function getPastEvents(): Promise<DbEvent[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .lt('date', today)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching past events:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene un evento específico por su ID.
 */
export async function getEventById(id: string): Promise<DbEvent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export interface DbEventPhoto {
  id: string;
  event_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

/**
 * Obtiene las fotos de un evento ordenadas por display_order.
 */
export async function getEventPhotos(eventId: string): Promise<DbEventPhoto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching event photos:', error);
    return [];
  }

  return data ?? [];
}