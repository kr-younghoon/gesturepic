'use client'

import { useEffect } from 'react'
import { supabase } from '@/shared/api/supabase'
import { QueryProvider } from '@/shared/providers/query-provider'
import { useAuth } from '@/features/auth/model/use-auth'

export function ClientLayout({ children }) {
  const { setUser } = useAuth()

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Checking initial session:', session)
        
        if (error) {
          console.error('Error checking session:', error)
          return
        }
        
        if (session?.user) {
          console.log('Setting initial user:', session.user)
          setUser(session.user)
        } else {
          console.log('No initial session found')
          setUser(null)
        }
      } catch (error) {
        console.error('Error in checkSession:', error)
      }
    }

    // Run initial session check
    checkSession()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, session })
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user)
        setUser(session?.user || null)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed:', session?.user)
        setUser(session?.user || null)
      }
    })

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [setUser])

  return (
    <QueryProvider>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </QueryProvider>
  )
}
