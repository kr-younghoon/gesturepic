'use client'

import { useEffect } from 'react'
import { getSupabaseClient } from '@/shared/api/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { NavBar } from '@/features/navigation/ui/nav-bar'

export function ClientLayout({ children }) {
  const queryClient = useQueryClient()
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

  useEffect(() => {
    checkSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, queryClient])

  return (
    <>
      <NavBar />
      {children}
    </>
  )
}
