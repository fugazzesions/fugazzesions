import { createClient } from '@/lib/supabase/server';

export interface DbAboutPhoto {
  id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export async function getAboutPhotos(): Promise<DbAboutPhoto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('about_photos')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching about photos:', error);
    return [];
  }

  return data ?? [];
}