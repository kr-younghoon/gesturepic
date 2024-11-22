'use client'

import { useSession, useSignInWithGoogle, useSignOut } from '../model/use-session'
import { useEffect } from 'react'

export function AuthButton() {
  const { data: session, isLoading: isSessionLoading } = useSession()
  const { mutate: signIn, isPending: isSigningIn } = useSignInWithGoogle()
  const { mutate: signOut } = useSignOut()

  useEffect(() => {
    // Get error from URL if it exists
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlError = params.get('error')
      if (urlError) {
        console.error('Auth error from URL:', urlError)
      }
    }
  }, [])

  const isLoading = isSessionLoading || isSigningIn

  return (
    <div className="flex flex-col items-center gap-2">
      {isLoading ? (
        <button 
          className="relative px-4 py-2 bg-gray-100 text-gray-400 rounded-md w-[200px] flex items-center justify-center" 
          disabled
        >
          <div className="absolute left-4">
            <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin" />
          </div>
          <span>Connecting...</span>
        </button>
      ) : session ? (
        <button
          onClick={() => signOut()}
          className="w-[200px] px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={() => signIn()}
          className="w-[200px] flex items-center justify-center gap-2 px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      )}
    </div>
  )
}
