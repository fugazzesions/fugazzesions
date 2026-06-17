'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Agrega una foto a la galería de un evento.
 */
export async function addEventPhoto(eventId: string, imageUrl: string) {
  const supabase = await createClient();

  // Buscar el último display_order existente
  const { data: lastPhoto } = await supabase
    .from('event_photos')
    .select('display_order')
    .eq('event_id', eventId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (lastPhoto?.display_order ?? 0) + 1;

  const { error } = await supabase
    .from('event_photos')
    .insert({
      event_id: eventId,
      image_url: imageUrl,
      display_order: nextOrder,
    });

  if (error) {
    console.error('Error adding photo:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}`);

  return { success: true };
}

/**
 * Elimina una foto de la galería.
 */
export async function deleteEventPhoto(photoId: string, eventId: string) {
  const supabase = await createClient();

  // Primero buscar la URL para borrar también el archivo de Storage
  const { data: photo } = await supabase
    .from('event_photos')
    .select('image_url')
    .eq('id', photoId)
    .single();

  // Eliminar el registro de la tabla
  const { error } = await supabase
    .from('event_photos')
    .delete()
    .eq('id', photoId);

  if (error) {
    console.error('Error deleting photo:', error);
    return { success: false, error: error.message };
  }

  // Intentar borrar el archivo de storage (sin bloquear si falla)
  if (photo?.image_url) {
    const filename = photo.image_url.split('/').pop();
    if (filename) {
      await supabase.storage.from('event-photos').remove([filename]);
    }
  }

  revalidatePath(`/admin/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}`);

  return { success: true };
}