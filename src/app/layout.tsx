import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Fairview Volunteers',
    template: '%s | Fairview Volunteers'
  },
  description: 'Sign up for volunteer shifts in Fairview County.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white font-sans text-zinc-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:outline-2 focus:outline-blue-700"
        >
          Skip to main content
        </a>
        <header className="border-b border-zinc-300">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <Link
              href="/"
              className="inline-block py-2 text-lg font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-700"
            >
              Fairview Volunteers
            </Link>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl px-4 py-8"
        >
          {children}
        </main>
      </body>
    </html>
  )
}
