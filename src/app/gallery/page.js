'use client'

import { useEffect, useRef, useCallback } from 'react'
import { PhotoGrid } from '@/features/gallery/ui/photo-grid'
import { usePhotos } from '@/features/gallery/model/use-photos'

export default function GalleryPage() {
  const {
    photos,
    totalPhotos,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    deletePhoto,
  } = usePhotos()

  const observerRef = useRef()

  const lastPhotoRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Error loading photos: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Photos</h1>
        <p className="text-gray-600">{totalPhotos} photos</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No photos yet. Head to the Studio to take some!
        </div>
      ) : (
        <PhotoGrid photos={photos} onDelete={deletePhoto} />
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-500" />
        </div>
      )}

      <div ref={lastPhotoRef} />
    </div>
  )
}
