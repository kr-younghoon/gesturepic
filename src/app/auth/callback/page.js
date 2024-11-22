'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/shared/api/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { searchParams } = new URL(window.location.href)
        const code = searchParams.get('code')
        
        if (!code) {
          console.error('Auth error: No code found in URL')
          return
        }

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Auth error:', error.message)
          return
        }

        // Redirect to home page after successful authentication
        router.push('/')
      } catch (error) {
        console.error('Auth callback error:', error)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg">
        Completing sign in...
      </div>
    </div>
  )
}
