import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { DateProvider } from '@/lib/date-context';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Habits App',
  description: 'Track and manage your daily habits',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DateProvider>
            {children}
          </DateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
