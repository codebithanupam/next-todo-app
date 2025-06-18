import './globals.css';

export const metadata = {
  title: 'Todo App',
  description: 'A modern todo application with Next.js and MongoDB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}