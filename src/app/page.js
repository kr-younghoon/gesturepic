'use client'

import { AuthButton } from '@/features/auth/ui/auth-button'
import { useSession } from '@/features/auth/model/use-session'

export default function Home() {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to GesturePic</h1>
          <p className="text-xl text-gray-600 mb-8">
            Capture photos with simple hand gestures. Head to the Studio to get started!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/studio"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Studio
            </a>
            <a
              href="/gallery"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Gallery
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to GesturePic</h1>
        <p className="text-xl text-gray-600 mb-8">
          Take photos hands-free using simple gestures. Sign in to get started!
        </p>
        <AuthButton />
      </div>
    </main>
  )
}