'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface ClassFormData {
  discipline: 'quad' | 'inline';
  level: number;
  level_name: string;
  description: string;
  schedule_days: string;
  schedule_time: string;
  location: string;
  capacity: number | null;
  price: number | null;
  form_url: string;
  active: boolean;
  display_order: number;
}

export async function createClass(data: ClassFormData) {
  const supabase = await createClient();

  const { data: newClass, error } = await supabase
    .from('classes')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating class:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/clases');
  revalidatePath('/clases');

  return { success: true, classId: newClass.id };
}

export async function updateClass(id: string, data: ClassFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('classes')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating class:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/clases');
  revalidatePath(`/admin/clases/${id}`);
  revalidatePath('/clases');

  return { success: true };
}

export async function deleteClass(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting class:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/clases');
  revalidatePath('/clases');

  redirect('/admin/clases');
}

/**
 * Toggle rápido del estado activo/pausado.
 */
export async function toggleClassActive(id: string, active: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('classes')
    .update({ active })
    .eq('id', id);

  if (error) {
    console.error('Error toggling class:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/clases');
  revalidatePath('/clases');

  return { success: true };
}