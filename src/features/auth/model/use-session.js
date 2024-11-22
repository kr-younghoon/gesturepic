'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/shared/api/supabase'

const SESSION_QUERY_KEY = ['session']

export function useSession() {
  const supabase = getSupabaseClient()
  
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })
}

export function useSignInWithGoogle() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    },
    onError: (error) => {
      console.error('Sign in error:', error)
      router.push(`/?error=${encodeURIComponent(error.message)}`)
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async () => {
      // Get current session first
      const { data: { session } } = await supabase.auth.getSession()
      
      // Always try to sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear React Query cache
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
      
      // Clear browser storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token')
        window.sessionStorage.removeItem('supabase.auth.token')
      }
      
      return session
    },
    onSuccess: () => {
      router.push('/')
    },
    onError: (error) => {
      console.error('Sign out error:', error)
      // Even on error, try to clear the local state
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
      router.push(`/?error=${encodeURIComponent(error.message)}`)
    },
  })
}
