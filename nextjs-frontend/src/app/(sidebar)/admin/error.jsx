'use client';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    Swal.fire({
      icon: 'error',
      title: 'Access Denied',
      text: 'You are not authorized to view this page.',
    }).then(() => {
      router.push('/');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Redirecting to home...
    </div>
  );
}
