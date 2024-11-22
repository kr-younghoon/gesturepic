import './globals.css'
import { ClientLayout } from './client-layout'
import { QueryProvider } from '@/shared/providers/query-provider'

export const metadata = {
  title: 'GesturePic',
  description: 'Gesture based photo sharing app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <QueryProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </QueryProvider>
      </body>
    </html>
  )
}