'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/api/supabase'

const SESSION_QUERY_KEY = ['session']

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useSignInWithGoogle() {
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
        }
      })
      if (error) throw error
      return data
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
    },
  })
}
