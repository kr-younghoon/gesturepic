'use client'

import { usePhotos } from '../model/use-photos'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { PhotoCard } from './photo-card'

export function PhotoGrid() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePhotos()
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    )
  }

  if (!data?.pages?.[0]?.photos?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No photos yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.pages.map((page, i) => (
        page.photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isLastItem={i === data.pages.length - 1 && index === page.photos.length - 1}
            observerRef={ref}
          />
        ))
      ))}
    </div>
  )
}
