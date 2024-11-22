'use client'

import { useSession } from '@/features/auth/model/use-session'
import { ProfileForm } from '@/features/profile/ui/profile-form'

export default function ProfilePage() {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <ProfileForm user={session.user} />
    </div>
  )
}
