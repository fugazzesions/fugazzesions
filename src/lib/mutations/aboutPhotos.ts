'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addAboutPhoto(imageUrl: string) {
  const supabase = await createClient();

  // Buscar el display_order más alto
  const { data: lastPhoto } = await supabase
    .from('about_photos')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (lastPhoto?.display_order ?? 0) + 1;

  const { error } = await supabase
    .from('about_photos')
    .insert({
      image_url: imageUrl,
      display_order: nextOrder,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/quienes-somos');
  revalidatePath('/quienes-somos');

  return { success: true };
}

export async function deleteAboutPhoto(photoId: string) {
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from('about_photos')
    .select('image_url')
    .eq('id', photoId)
    .single();

  const { error } = await supabase
    .from('about_photos')
    .delete()
    .eq('id', photoId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Intentar borrar el archivo de storage
  if (photo?.image_url) {
    const filename = photo.image_url.split('/').pop();
    if (filename) {
      await supabase.storage.from('about-photos').remove([filename]);
    }
  }

  revalidatePath('/admin/quienes-somos');
  revalidatePath('/quienes-somos');

  return { success: true };
}