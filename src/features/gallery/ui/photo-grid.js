'use client'

import Image from 'next/image'
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

export function PhotoGrid({ photos, onDelete }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const handleDelete = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      await onDelete(photoId)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
        >
          <Image
            src={photo.url}
            alt={photo.title || 'Photo'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onClick={() => setSelectedPhoto(photo)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
          <button
            onClick={() => handleDelete(photo.id)}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative w-full max-w-4xl aspect-square">
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Photo'}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
