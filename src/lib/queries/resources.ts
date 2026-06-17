import { createClient } from '@/lib/supabase/server';

export interface DbResourceCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
}

export interface DbResource {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  file_url: string;
  file_size_mb: number | null;
  page_count: number | null;
  tag: 'new' | 'recommended' | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todas las categorías ordenadas por display_order.
 */
export async function getResourceCategories(): Promise<DbResourceCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('resource_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene todos los recursos ordenados por categoría y display_order.
 */
export async function getResources(): Promise<DbResource[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }

  return data ?? [];
}

/**
 * Obtiene un recurso específico por su ID.
 */
export async function getResourceById(id: string): Promise<DbResource | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching resource:', error);
    return null;
  }

  return data;
}