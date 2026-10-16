import { FieldError } from '@/components/field-error'

type TextFieldProps = {
  id: string
  name: string
  label: string
  type?: 'text' | 'email'
  autoComplete?: string
  defaultValue?: string
  error?: string
}

// A label, an input and its error, wired together: the label points at the
// input, and when there is an error the input is marked invalid and
// described by the error text.
export const TextField = ({
  id,
  name,
  label,
  type = 'text',
  autoComplete,
  defaultValue,
  error
}: TextFieldProps) => {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="min-h-11 rounded border border-zinc-500 bg-white px-3 py-2 text-zinc-900 outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-800"
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}
