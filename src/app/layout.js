import "./globals.css";

export const metadata = {
  title: "GesturePic",
  description: "Hand gesture based photo application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}