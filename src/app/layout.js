import './globals.css'

export const metadata = {
  title: 'GesturePic',
  description: 'Hand gesture based photo application',
}

import { ClientLayout } from './client-layout'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}