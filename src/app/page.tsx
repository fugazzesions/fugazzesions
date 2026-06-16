import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Test de conexión Supabase</h1>

      {error && (
        <div style={{ background: '#fee', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
          <strong>Error:</strong>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {!error && (
        <div style={{ background: '#efe', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
          <strong>✓ Conexión OK</strong>
          <p>Eventos encontrados: {events?.length ?? 0}</p>
          <pre>{JSON.stringify(events, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}