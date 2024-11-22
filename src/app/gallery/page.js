'use client'

import { PhotoGrid } from '@/features/photos/ui/photo-grid'

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Photos</h1>
      <PhotoGrid />
    </div>
  )
}
