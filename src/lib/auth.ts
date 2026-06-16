import { createClient } from '@/lib/supabase/server';

/**
 * Obtiene el usuario actual desde el servidor.
 * Retorna null si no hay sesión activa.
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}