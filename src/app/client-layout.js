'use client'

import { useEffect } from 'react'
import { getSupabaseClient } from '@/shared/api/supabase'
import { QueryProvider } from '@/shared/providers/query-provider'
import { useQueryClient } from '@tanstack/react-query'

export function ClientLayout({ children }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Checking initial session:', session)
        if (!session) {
          console.log('No initial session found')
          queryClient.setQueryData(['session'], null)
        } else {
          console.log('Initial session found:', session?.user)
          queryClient.setQueryData(['session'], session)
        }
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
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user)
        queryClient.setQueryData(['session'], session)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        queryClient.setQueryData(['session'], null)
      }
    })

    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [queryClient])

  return (
    <QueryProvider>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </QueryProvider>
  )
}
