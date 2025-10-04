import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BudgetBuddy - Personal Finance Manager',
  description: 'Manage your budget and track your expenses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the current route is an auth page
  const isAuthPage = false; // You'll need to implement route detection

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAuthPage && <Header />}
        {children}
      </body>
    </html>
  );
}