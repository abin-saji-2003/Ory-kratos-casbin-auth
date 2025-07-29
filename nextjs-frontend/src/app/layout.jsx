import './globals.css';

export const metadata = {
  title: 'My App',
  description: 'Next.js app with Kratos login system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
