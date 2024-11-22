'use client'

import { useEffect } from 'react'
import { getSupabaseClient } from '@/shared/api/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function ClientLayout({ children }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        queryClient.setQueryData(['session'], session)
      } catch (error) {
        console.error('Error checking session:', error)
        queryClient.setQueryData(['session'], null)
      }
    }
    checkSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, session })
      queryClient.setQueryData(['session'], session)
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  return children
}
