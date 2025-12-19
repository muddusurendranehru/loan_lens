import { redirect } from 'next/navigation';

export default function SignUp() {
  // For personal app: skip signup, go to login
  redirect('/login');
}

