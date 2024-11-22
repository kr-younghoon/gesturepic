import { QueryClient, QueryClientProvider } from 'react-query';
import './globals.css'

const queryClient = new QueryClient();

export const metadata = {
  title: 'GesturePic',
  description: 'Gesture based photo sharing app',
}

import { ClientLayout } from './client-layout'

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body className="min-h-screen bg-gray-100">
          <ClientLayout>{children}</ClientLayout>
        </body>
      </html>
    </QueryClientProvider>
  )
}