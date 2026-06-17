'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location_name: string;
  address: string;
  image_url: string | null;
  is_paid: boolean;
  price: number | null;
  ticket_url: string | null;
  published: boolean;
}

/**
 * Crea un nuevo evento.
 */
export async function createEvent(data: EventFormData) {
  const supabase = await createClient();

  const { data: newEvent, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/eventos');
  revalidatePath('/eventos');
  revalidatePath('/');

  return { success: true, eventId: newEvent.id };
}

/**
 * Actualiza un evento existente.
 */
export async function updateEvent(id: string, data: EventFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/eventos');
  revalidatePath(`/admin/eventos/${id}`);
  revalidatePath('/eventos');
  revalidatePath(`/eventos/${id}`);
  revalidatePath('/');

  return { success: true };
}

/**
 * Elimina un evento (y por cascada sus fotos).
 */
export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/eventos');
  revalidatePath('/eventos');
  revalidatePath('/');

  redirect('/admin/eventos');
}