'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/features/auth/model/use-session'
import Image from 'next/image'

export function NavBar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path) => pathname === path

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">GesturePic</span>
          </Link>

          {/* Navigation Links */}
          {session?.user && (
            <div className="flex items-center space-x-4">
              <Link
                href="/gallery"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/gallery')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Gallery
              </Link>
              <Link
                href="/studio"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/studio')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Studio
              </Link>
            </div>
          )}

          {/* Profile Section */}
          {session?.user ? (
            <Link
              href="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                isActive('/profile')
                  ? 'bg-blue-100'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="relative h-8 w-8 shrink-0">
                {session.user.user_metadata?.avatar_url ? (
                  <Image
                    src={session.user.user_metadata.avatar_url}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {session.user.user_metadata?.name || 'Profile'}
              </span>
            </Link>
          ) : (
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
