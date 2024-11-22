'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ErrorDisplay() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error)
    }
  }, [error])

  if (!error) return null

  return (
    <p className="text-red-500">
      {error === 'no_session' 
        ? 'Failed to create session. Please try again.' 
        : error === 'no_code'
        ? 'No authentication code provided.'
        : `Authentication error: ${error}`}
    </p>
  )
}
