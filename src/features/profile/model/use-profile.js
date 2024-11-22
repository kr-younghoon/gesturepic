'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile } from '@/shared/api/profile'
import { SESSION_QUERY_KEY } from '@/features/auth/model/use-session'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, avatar }) => {
      return await updateUserProfile({ name, avatar })
    },
    onSuccess: (data) => {
      // Update session data with new user metadata
      const currentSession = queryClient.getQueryData(SESSION_QUERY_KEY)
      if (currentSession) {
        queryClient.setQueryData(SESSION_QUERY_KEY, {
          ...currentSession,
          user: {
            ...currentSession.user,
            user_metadata: {
              ...currentSession.user.user_metadata,
              ...data.user_metadata,
            },
          },
        })
      }
    },
  })
}
