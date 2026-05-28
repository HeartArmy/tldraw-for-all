import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Board from './board'

export default async function HomePage() {
  if (!(await isAuthenticated())) redirect('/login')
  return <Board />
}
