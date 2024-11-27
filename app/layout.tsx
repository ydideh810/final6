import './globals.css';
import { Press_Start_2P } from 'next/font/google';
import { Metadata } from 'next';

const pressStart2P = Press_Start_2P({ 
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'N.I.D.A.M | Neural Interface for Decentralized Artificial Minds',
  description: 'Advanced AI system designed for secure, decentralized interactions',
  icons: {
    icon: '/cle.ico',
    shortcut: '/cle.ico',
    apple: '/cle.ico',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={pressStart2P.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
