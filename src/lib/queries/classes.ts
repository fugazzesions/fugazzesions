import { createClient } from '@/lib/supabase/server';

export interface DbClass {
  id: string;
  discipline: 'quad' | 'inline';
  level: number;
  level_name: string;
  description: string | null;
  schedule_days: string | null;
  schedule_time: string | null;
  location: string | null;
  capacity: number | null;
  price: number | null;
  form_url: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todas las clases activas, ordenadas por disciplina y display_order.
 */
export async function getActiveClasses(): Promise<DbClass[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('active', true)
    .order('discipline', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene TODAS las clases (activas y pausadas) — para el admin.
 */
export async function getAllClasses(): Promise<DbClass[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('discipline', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene una clase específica por su ID.
 */
export async function getClassById(id: string): Promise<DbClass | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching class:', error);
    return null;
  }

  return data;
}