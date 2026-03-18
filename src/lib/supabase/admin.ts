import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function adminOperation<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    console.error('Admin operation failed:', error)
    throw new Error('Internal server error')
  }
}
