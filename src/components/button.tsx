import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

// The one button style. At least 44 by 44 CSS pixels, with a visible focus
// ring, so it meets the target size and focus rules without each caller
// remembering them.
export const Button = ({ className = '', ...props }: ButtonProps) => (
  <button
    {...props}
    className={`min-h-11 min-w-11 rounded bg-blue-800 px-5 py-2 font-medium text-white outline-offset-2 hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-blue-700 ${className}`}
  />
)
