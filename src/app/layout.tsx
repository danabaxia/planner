import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Container } from '@/components/ui'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daily Activity Planner',
  description:
    'A beautiful Notion-powered daily activity planner with Motion-inspired design',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Container 
            size="full" 
            className="min-h-screen bg-background text-foreground"
            as="div"
          >
            {children}
          </Container>
        </SessionProvider>
      </body>
    </html>
  )
}
