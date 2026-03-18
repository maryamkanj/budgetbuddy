import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: import("@supabase/ssr").CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {

          }
        },
        remove(name: string, options: import("@supabase/ssr").CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {

          }
        },
      },
    }
  )
}


export const supabaseServer = createServerSupabase
