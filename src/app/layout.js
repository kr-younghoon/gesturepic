import './globals.css'
import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const metadata = {
  title: 'GesturePic',
  description: 'Hand gesture based photo application',
}

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}