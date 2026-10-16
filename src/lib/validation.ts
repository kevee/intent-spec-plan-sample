import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().trim().min(1, { error: 'Enter your name.' }),
  email: z
    .string()
    .min(1, { error: 'Enter your email address.' })
    .pipe(z.email({ error: 'Enter an email address like name@example.org.' }))
})

export type SignupInput = z.infer<typeof signupSchema>

export type SignupErrors = Partial<Record<keyof SignupInput, string>>

export type ParsedSignup =
  { ok: true; data: SignupInput } | { ok: false; errors: SignupErrors }

const fieldValue = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === 'string' ? value : ''
}

// Reads the sign-up form and returns either clean data or one message per
// field. The email is kept exactly as typed.
export const parseSignup = (formData: FormData): ParsedSignup => {
  const result = signupSchema.safeParse({
    name: fieldValue(formData, 'name'),
    email: fieldValue(formData, 'email')
  })

  if (result.success) {
    return { ok: true, data: result.data }
  }

  const errors: SignupErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if ((field === 'name' || field === 'email') && !errors[field]) {
      errors[field] = issue.message
    }
  }
  return { ok: false, errors }
}
