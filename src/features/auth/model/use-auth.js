'use client'

import { create } from 'zustand'
import { supabase } from '@/shared/api/supabase'

export const useAuth = create((set) => {
  console.log('Creating auth store')
  return {
    user: null,
    loading: false,
    error: null,
    isSigningIn: false,
  
    signInWithGoogle: async () => {
      try {
        set({ loading: true, error: null, isSigningIn: true })
        console.log('Starting Google sign in...')
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          console.error('Sign in error:', error)
          throw error
        }
        
        console.log('Sign in response:', data)
      } catch (error) {
        console.error('Sign in failed:', error)
        set({ error: error.message })
      } finally {
        set({ loading: false })
        // isSigningIn은 유지 (사용자가 리디렉션되는 동안 로딩 상태 표시)
      }
    },

    signOut: async () => {
      try {
        set({ loading: true, error: null })
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null })
      } catch (error) {
        console.error('Sign out failed:', error)
        set({ error: error.message })
      } finally {
        set({ loading: false })
      }
    },

    setUser: (user) => {
      set({ user, isSigningIn: false }) // 사용자 설정 시 isSigningIn 초기화
    },

    setLoading: (loading) => set({ loading }),

    clearError: () => set({ error: null }),
  }
})
