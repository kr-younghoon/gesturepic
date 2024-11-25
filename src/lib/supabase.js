import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveResult(resultData) {
  try {
    const { data, error } = await supabase
      .from('results')
      .insert([
        {
          result_data: resultData,
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error saving result:', error)
    return { data: null, error }
  }
}
