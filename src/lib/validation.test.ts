import { formData } from '@/lib/test-db'
import { parseSignup } from '@/lib/validation'

describe('parseSignup', () => {
  it('accepts a name and an email address', () => {
    const result = parseSignup(
      formData({ name: 'Alex Chen', email: 'alex.chen@example.org' })
    )
    expect(result).toEqual({
      ok: true,
      data: { name: 'Alex Chen', email: 'alex.chen@example.org' }
    })
  })

  it('trims the name', () => {
    const result = parseSignup(
      formData({ name: '  Alex Chen ', email: 'alex.chen@example.org' })
    )
    expect(result.ok && result.data.name).toBe('Alex Chen')
  })

  it('keeps the email exactly as typed', () => {
    const result = parseSignup(
      formData({ name: 'Sam Okafor', email: 'Sam.Okafor@example.org' })
    )
    expect(result.ok && result.data.email).toBe('Sam.Okafor@example.org')
  })

  it('asks for both fields when they are empty', () => {
    const result = parseSignup(formData({ name: '', email: '' }))
    expect(result).toEqual({
      ok: false,
      errors: { name: 'Enter your name.', email: 'Enter your email address.' }
    })
  })

  it('treats a missing field like an empty one', () => {
    const result = parseSignup(formData({}))
    expect(result.ok).toBe(false)
  })

  it('rejects an address that is not an email', () => {
    const result = parseSignup(formData({ name: 'Alex Chen', email: 'alex' }))
    expect(result).toEqual({
      ok: false,
      errors: { email: 'Enter an email address like name@example.org.' }
    })
  })
})
