import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const AdminDashboard = () => {
    const navigate=useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL

    useEffect(()=>{
        fetch(`${apiUrl}/admin/dashboard`,{
            method:'GET',
            credentials:"include",
        })
        .then(res=>{
            if (!res.ok){
                throw new Error('Unauthorized')
            }
            return res.json()
        })
        .then(data=>{
            if (data.status==='success'){

            }else{
                navigate("/")
            }
        })
        .catch(err=>{
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: err.message || 'You are not authorized to view this page',
                confirmButtonColor: '#d33',
              }).then(() => {
                navigate('/')
              })
        })
    },[navigate])
  return (
    <div>
      <p>Hi</p>
    </div>
  )
}

export default AdminDashboard