import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        // Redirect to error page or home with error param
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      if (!session) {
        console.error('No session returned after code exchange')
        return NextResponse.redirect(
          new URL('/?error=no_session', requestUrl.origin)
        )
      }

      console.log('Successfully exchanged code for session')
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    } catch (error) {
      console.error('Unexpected error in callback:', error)
      return NextResponse.redirect(
        new URL(`/?error=unexpected`, requestUrl.origin)
      )
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin))
}