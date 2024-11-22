'use client'

import { create } from 'zustand'
import { supabase } from '@/shared/api/supabase'

export const useAuth = create((set) => ({
  user: null,
  loading: true,
  error: null,
  
  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://kaipqjktuazebdqqmcjs.supabase.co/auth/v1/callback'
        }
      })
      if (error) throw error
    } catch (error) {
      set({ error: error.message })
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null })
    } catch (error) {
      set({ error: error.message })
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearError: () => set({ error: null })
}))
