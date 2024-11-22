'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useAuth } from '@/features/auth/model/use-auth'

export function ClientLayout({ children }) {
  const supabase = createClientComponentClient()
  const { setUser } = useAuth()

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error checking session:', error)
        return
      }
      if (session) {
        console.log('Initial session found:', session)
        setUser(session.user)
      }
    }
    checkSession()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUser])

  return (
    <div className="container mx-auto px-4">
      {children}
    </div>
  )
}
