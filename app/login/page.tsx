import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import LoginForm from './login-form'

export default async function LoginPage() {
  if (await isAuthenticated()) redirect('/')

  return (
    <main className="login-shell">
      <section className="login-panel">
        <h1>Private Board</h1>
        <p>Enter the password to open your persistent canvas.</p>
        <LoginForm />
      </section>
    </main>
  )
}
