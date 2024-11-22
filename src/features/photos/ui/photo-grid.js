'use client'

import { usePhotos } from '../model/use-photos'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import Image from 'next/image'

export function PhotoGrid() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePhotos()
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) {
    return <div>Loading...</div>
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
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden"
            ref={i === data.pages.length - 1 && index === page.photos.length - 1 ? ref : undefined}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.storage_path}`}
              alt={photo.title || 'Photo'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))
      ))}
    </div>
  )
}
