// ✅ CORRECT — Server Component
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient searchParams={searchParams} />
    </Suspense>
  );
}
