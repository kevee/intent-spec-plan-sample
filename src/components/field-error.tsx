type FieldErrorProps = {
  id: string
  message?: string
}

// Announced as soon as it appears, so a screen reader hears the error without
// hunting for it. Renders nothing when there is no error.
export const FieldError = ({ id, message }: FieldErrorProps) => {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-sm font-medium text-red-800">
      {message}
    </p>
  )
}
