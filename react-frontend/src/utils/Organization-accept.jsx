import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import Swal from 'sweetalert2';

const AcceptInvitePage = () => {
  const { orgId } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    console.log("orgId:", orgId); 

    const acceptInvite = async () => {
      try {
        await axios.post(
          `http://localhost:8080/organization/${orgId}/accept`,
          {},
          { withCredentials: true }
        );
        Swal.fire({
          title: 'Invitation Accepted!',
          text: 'You have successfully joined the organization.',
          icon: 'success',
          iconColor: '#7D52F4', 
          background: '#ffffff',
          color: '#4A5568', // Soft dark gray for text
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          position: 'top-end',
          width: '400px',
          backdrop: `
            rgba(125, 82, 244, 0.1)
            left top
            no-repeat
          `,
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
        navigate('/organization');
      } catch (err) {
        console.error(err);
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
        navigate('/organization');
      }
    };

    if (orgId) {
      acceptInvite();
    } else {
      navigate('/organization');
    }
  }, [orgId, navigate]);

  return <p className="text-center mt-20">Accepting your invitation...</p>;
};

export default AcceptInvitePage;
