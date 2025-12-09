import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Panela',
  description: 'Sistema completo para la gestión de inventarios de panela',
  keywords: ['panela', 'inventario', 'gestión', 'producción'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}