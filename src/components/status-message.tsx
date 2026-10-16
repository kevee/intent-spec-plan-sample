'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type StatusMessageProps = {
  children: ReactNode
  // Move focus here when the message replaces something that had focus, like
  // the form after a sign-up. Leave it off for messages that are on the page
  // from the start.
  focusOnMount?: boolean
}

// A polite live region for outcomes the user needs to hear: a confirmation,
// or the news that a shift has filled.
export const StatusMessage = ({
  children,
  focusOnMount = false
}: StatusMessageProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusOnMount) ref.current?.focus()
  }, [focusOnMount])

  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="rounded border border-green-800 bg-green-50 p-4 text-zinc-900 outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-700"
    >
      {children}
    </div>
  )
}
