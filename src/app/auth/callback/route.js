import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  
  // Create authenticated Supabase client
  const supabase = createRouteHandlerClient({ cookies })

  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL(`${next}?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
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