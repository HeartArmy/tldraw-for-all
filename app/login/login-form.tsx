'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password: formData.get('password') }),
      headers: { 'content-type': 'application/json' },
    })

    setIsSubmitting(false)

    if (!response.ok) {
      setError('Incorrect password.')
      return
    }

    router.replace('/')
    router.refresh()
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <input
        autoComplete="current-password"
        autoFocus
        name="password"
        placeholder="Password"
        type="password"
      />
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Opening...' : 'Open board'}
      </button>
      <div className="login-error" role="status">
        {error}
      </div>
    </form>
  )
}
