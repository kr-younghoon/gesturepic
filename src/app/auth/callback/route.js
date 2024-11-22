import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  // Create Supabase client
  const supabase = createRouteHandlerClient({ cookies })

  if (code) {
    try {
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(
          new URL(`${next}?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      if (!session) {
        console.error('No session returned after code exchange')
        return NextResponse.redirect(
          new URL(`${next}?error=no_session`, requestUrl.origin)
        )
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error('Unexpected error in callback:', error)
      return NextResponse.redirect(
        new URL(`${next}?error=unexpected`, requestUrl.origin)
      )
    }
  }

  // If no code is present, assume it's a hash fragment response
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}