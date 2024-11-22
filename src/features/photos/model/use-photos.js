import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserPhotos, deletePhoto, uploadPhoto } from '@/shared/api/photos'
import { useSession } from '@/features/auth/model/use-session'

const PHOTOS_QUERY_KEY = 'photos'

export function usePhotos() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useInfiniteQuery({
    queryKey: [PHOTOS_QUERY_KEY, userId],
    queryFn: ({ pageParam = 0 }) => fetchUserPhotos({ userId, page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined
      return pages.length
    },
    enabled: !!userId,
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries([PHOTOS_QUERY_KEY, userId])
    },
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: (data) => uploadPhoto({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries([PHOTOS_QUERY_KEY, userId])
    },
  })
}
