import './globals.css'

export const metadata = {
  title: 'GesturePic',
  description: 'Hand gesture based photo application',
}

import { ClientLayout } from './client-layout'

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>
}