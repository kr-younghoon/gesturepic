import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/model/use-session'
import { fetchUserPhotos, deletePhoto } from '@/shared/api/photos'

export function usePhotos() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['photos', session?.user?.id],
    queryFn: ({ pageParam = 0 }) =>
      fetchUserPhotos({ userId: session?.user?.id, page: pageParam }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined,
    enabled: !!session?.user?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries(['photos', session?.user?.id])
    },
  })

  const photos = data?.pages.flatMap((page) => page.photos) ?? []
  const totalPhotos = data?.pages[0]?.total ?? 0

  return {
    photos,
    totalPhotos,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    deletePhoto: deleteMutation.mutate,
  }
}
