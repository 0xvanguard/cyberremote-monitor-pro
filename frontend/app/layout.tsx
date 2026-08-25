import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CyberRemote Monitor Pro',
  description: 'Intelligence Board Global de Empleo Remoto en Ciberseguridad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-cyber-darker text-white">
          {children}
        </div>
      </body>
    </html>
  )
}
