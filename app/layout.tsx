import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geo-Facial checkify',
  description: 'Attendance with facial and geo-location',
  generator: 'Geo-Facial checkify',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
