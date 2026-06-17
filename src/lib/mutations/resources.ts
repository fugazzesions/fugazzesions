'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface ResourceFormData {
  title: string;
  description: string;
  category_id: string | null;
  file_url: string;
  file_size_mb: number | null;
  page_count: number | null;
  tag: 'new' | 'recommended' | null;
  display_order: number;
}

export async function createResource(data: ResourceFormData) {
  const supabase = await createClient();

  const { data: newResource, error } = await supabase
    .from('resources')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating resource:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/recursos');
  revalidatePath('/recursos');

  return { success: true, resourceId: newResource.id };
}

export async function updateResource(id: string, data: ResourceFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('resources')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating resource:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/recursos');
  revalidatePath(`/admin/recursos/${id}`);
  revalidatePath('/recursos');

  return { success: true };
}

export async function deleteResource(id: string) {
  const supabase = await createClient();

  // Buscar la URL del archivo para borrarlo del storage
  const { data: resource } = await supabase
    .from('resources')
    .select('file_url')
    .eq('id', id)
    .single();

  // Eliminar el registro
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting resource:', error);
    return { success: false, error: error.message };
  }

  // Intentar borrar el archivo (sin bloquear si falla)
  if (resource?.file_url) {
    const filename = resource.file_url.split('/').pop();
    if (filename) {
      await supabase.storage.from('resources').remove([filename]);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/recursos');
  revalidatePath('/recursos');

  redirect('/admin/recursos');
}

// ─── Categorías ─────────────────────────────────────────────

export async function createCategory(name: string, slug: string) {
  const supabase = await createClient();

  // Buscar el display_order más alto
  const { data: lastCat } = await supabase
    .from('resource_categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (lastCat?.display_order ?? 0) + 1;

  const { error } = await supabase
    .from('resource_categories')
    .insert({ name, slug, display_order: nextOrder });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/recursos');
  revalidatePath('/recursos');

  return { success: true };
}

export async function updateCategory(id: string, name: string, slug: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('resource_categories')
    .update({ name, slug })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/recursos');
  revalidatePath('/recursos');

  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  // Los recursos asociados quedan con category_id = null (por ON DELETE SET NULL en el schema)
  const { error } = await supabase
    .from('resource_categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/recursos');
  revalidatePath('/recursos');

  return { success: true };
}