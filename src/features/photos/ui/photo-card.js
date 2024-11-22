'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useDeletePhoto } from '../model/use-photos'

export function PhotoCard({ photo, isLastItem, observerRef }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const deletePhoto = useDeletePhoto()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setIsDeleting(true)
      try {
        await deletePhoto.mutateAsync(photo.id)
      } catch (error) {
        console.error('Failed to delete photo:', error)
        alert('Failed to delete photo')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div
      ref={isLastItem ? observerRef : undefined}
      className="relative aspect-square rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.storage_path}`}
        alt={photo.title || 'Photo'}
        fill
        className={`object-cover transition-opacity duration-200 ${
          isDeleting ? 'opacity-50' : 'opacity-100'
        }`}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 
          ${showDeleteButton ? 'opacity-100' : 'group-hover:opacity-100'} 
          transition-opacity duration-200 hover:bg-red-600 disabled:bg-gray-400`}
        aria-label="Delete photo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Loading Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  )
}
