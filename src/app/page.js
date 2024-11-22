'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { AuthButton } from '@/features/auth/ui/auth-button'

export default function Home() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error)
    }
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold">GesturePic</h1>
        {error && (
          <p className="text-red-500">
            {error === 'no_session' 
              ? 'Failed to create session. Please try again.' 
              : error === 'no_code'
              ? 'No authentication code provided.'
              : `Authentication error: ${error}`}
          </p>
        )}
        <AuthButton />
      </div>
    </main>
  )
}