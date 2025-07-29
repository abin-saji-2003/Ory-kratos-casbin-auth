'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoginForm from './LoginForm';
import { startLoginFlow } from '../../lib/kratos';

const KRATOS_PUBLIC_URL = process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL;

export default function LoginPage() {
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${KRATOS_PUBLIC_URL}/sessions/whoami`, {
        withCredentials: true,
      })
      .then((res) => {
        const userId = res.data.identity.id;
        axios
          .post('/api/auth/assign-role', { userId, role: 'reader' }, { withCredentials: true })
          .then(() => {
            router.push('/');
          })
          .catch(() => {
            router.push('/');
          });
      })
      .catch(() => {
        setCheckingAuth(false);
        startLoginFlow(setFlowId, setCsrfToken, setError);
      });
  }, [router]);

  if (checkingAuth) return null;

  return (
    <LoginForm
      flowId={flowId}
      csrfToken={csrfToken}
      setError={setError}
      error={error}
    />
  );
}
