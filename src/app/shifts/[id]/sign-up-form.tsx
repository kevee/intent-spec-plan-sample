'use client'

import { useActionState } from 'react'

import { Button } from '@/components/button'
import { StatusMessage } from '@/components/status-message'
import { TextField } from '@/components/text-field'

import type { SignUpState } from './actions'

type SignUpFormProps = {
  action: (previous: SignUpState, formData: FormData) => Promise<SignUpState>
}

const initialState: SignUpState = { status: 'idle' }

export const SignUpForm = ({ action }: SignUpFormProps) => {
  const [state, formAction] = useActionState(action, initialState)

  if (state.status === 'signed-up' || state.status === 'full') {
    return <StatusMessage focusOnMount>{state.message}</StatusMessage>
  }

  const errors = state.status === 'invalid' ? state.errors : {}
  const values = state.status === 'invalid' ? state.values : undefined

  return (
    <form
      action={formAction}
      noValidate
      className="flex max-w-md flex-col gap-4"
    >
      <h2 className="text-xl font-semibold">Sign up</h2>
      {state.status === 'error' ? (
        <p role="alert" className="font-medium text-red-800">
          {state.message}
        </p>
      ) : null}
      <TextField
        id="name"
        name="name"
        label="Name"
        autoComplete="name"
        defaultValue={values?.name}
        error={errors.name}
      />
      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
      />
      <div>
        <Button type="submit">Sign up</Button>
      </div>
    </form>
  )
}
