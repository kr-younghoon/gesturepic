import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'GesturePic',
  description: 'Hand gesture recognition app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
