'use client'

import { CameraView } from '@/components/camera/CameraView'

export default function StudioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Studio</h1>
      <CameraView />
    </div>
  )
}
