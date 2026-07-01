import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_KEY as string

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_KEY en .env')
}

export const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 5 } },
})
