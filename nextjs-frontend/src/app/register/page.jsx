'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { RegisterForm } from './RegisterForm';
import { startRegisterFlow } from '../../lib/kratos';

export default function RegisterPage(){
    const [flowId, setFlowId] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [error, setError] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    const KRATOS_PUBLIC_URL = process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL;

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
        startRegisterFlow(setFlowId, setCsrfToken, setError);
      });
  }, [router]);

  if (checkingAuth) return null;

  return(
    <RegisterForm
        flowId={flowId}
        csrfToken={csrfToken}
        setError={setError}
        error={error}
    />
  )
}