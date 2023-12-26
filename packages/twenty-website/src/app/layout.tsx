import type { Metadata } from 'next'
import { Gabarito } from 'next/font/google'
import EmotionRootStyleRegistry from './emotion-root-style-registry'
import styled from '@emotion/styled'
import { HeaderNav } from './components/HeaderNav'
import { FooterNav } from './components/FooterNav'

export const metadata: Metadata = {
  title: 'Twenty.dev',
  description: 'Twenty for Developer',
  icons: '/favicon.ico',
}

const gabarito = Gabarito({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={gabarito.className}>
      <body style={{
              margin: 0,
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale"
      }}>
      <EmotionRootStyleRegistry>
        <HeaderNav />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {children}
        </div>
        <FooterNav />
        </EmotionRootStyleRegistry>
      </body>
    </html>
  )
}
