import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Registration disabled — redirect to login
  redirect('/login')
}
