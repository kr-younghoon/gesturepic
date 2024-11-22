'use client'

import './globals.css'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useAuth } from '@/features/auth/model/use-auth'

export const metadata = {
  title: 'GesturePic',
  description: 'Hand gesture based photo application',
}

export default function RootLayout({ children }) {
  const supabase = createClientComponentClient()
  const { setUser } = useAuth()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUser])

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  )
}