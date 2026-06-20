import React from "react"
import type { Metadata } from 'next'
import { Lilita_One, Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from '@/context/WalletContext'
import './globals.css'

const lilitaOne = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vault of Clans | Web3 Village Builder',
  description: 'Build your village, train your army, and stake your ETH in this Web3-powered Clash of Clans strategy game.',
  generator: 'Vault of Clans',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lilitaOne.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
