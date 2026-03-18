import {
  Inter,
  JetBrains_Mono
} from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <title>BudgetBuddy</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans h-full overflow-hidden antialiased bg-background text-foreground`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}