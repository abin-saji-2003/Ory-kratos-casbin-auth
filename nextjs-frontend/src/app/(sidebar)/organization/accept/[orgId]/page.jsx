'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.orgId;

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/organization/${orgId}/accept`,
          {},
          { withCredentials: true }
        );

        Swal.fire({
          title: 'Invitation Accepted!',
          text: 'You have successfully joined the organization.',
          icon: 'success',
          iconColor: '#7D52F4',
          background: '#ffffff',
          color: '#4A5568',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          position: 'top-end',
          width: '400px',
          backdrop: `rgba(125, 82, 244, 0.1) left top no-repeat`,
          customClass: {
            popup: 'shadow-lg rounded-xl border border-gray-100',
            title: 'text-2xl font-semibold text-gray-800',
            icon: 'border-2 border-purple-100',
            timerProgressBar: 'bg-purple-500',
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster'
          }
        });

        router.push('/organization');
      } catch (err) {
        console.error('Error accepting invite:', err);

        if (err.response?.status === 409) {
          Swal.fire({
            icon: 'info',
            title: 'Already Joined',
            text: 'You are already a member of this organization.',
            iconColor: '#f59e0b',
            confirmButtonColor: '#7D52F4',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to accept invite',
            text: 'Something went wrong. Please try again later.',
            confirmButtonColor: '#7D52F4',
          });
        }

        router.push('/organization');
      }
    };

    if (orgId) {
      acceptInvite();
    } else {
      router.push('/organization');
    }
  }, [orgId, router]);

  return <p className="text-center mt-20 text-gray-600">Accepting your invitation...</p>;
}
