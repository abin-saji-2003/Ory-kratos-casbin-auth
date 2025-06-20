import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const AdminDashboard = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [currentUser,setCurrentUser]=useState("")
  const [openDropdown, setOpenDropdown] = useState(null);

  const roles = ['admin', 'writer', 'reader'];

  useEffect(() => {
    fetch(`${apiUrl}/admin/dashboard`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setUsers(data.users);
          setCurrentUser(data.current.id);
        } else {
          navigate('/');
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: err.message || 'You are not authorized to view this page',
          confirmButtonColor: '#d33',
        }).then(() => {
          navigate('/');
        });
      });
  }, [navigate, apiUrl]);

  const handleRoleChange = (user, newRole) => {
    if (!user?.id || !newRole) {
      console.error('Missing user ID or role');
      return;
    }
    console.log(newRole)

    fetch(`${apiUrl}/admin/users/${user.id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ new_role: newRole }),
    })
      .then((res) => res.json())
      .then((data) => {
        Swal.fire({
          icon: 'success',
          title: 'Role Updated',
          text: `${user.traits.name} is now ${newRole}`,
          confirmButtonColor: '#3085d6',
        });

        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === user.id ? { ...u, traits: { ...u.traits, role: newRole } } : u
          )
        );
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err.message || 'Could not update role',
          confirmButtonColor: '#d33',
        });
      });

    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <nav className="bg-white shadow-lg p-4 flex items-center justify-between">
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          onClick={() => window.history.back()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <div className="w-6"></div> 
      </nav>
  
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-gray-700">User Management</h2>
            
          </div>
          
          <div className="divide-y divide-gray-100">
            {users.map((user, index) => {
              const currentRole = user?.traits?.role || '';
  
              return (
                <div
                  key={index}
                  className="p-6 hover:bg-gray-50 transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-blue-600 font-medium">
                        {user.traits?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {user.traits?.name}
                        {currentRole === 'admin' ? (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-red-600 rounded-full">
                            Admin
                          </span>
                        ):
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-green-800 rounded-full">
                              {currentRole}
                          </span>}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.traits?.email}
                      </p>
                    </div>
                  </div>
  
                  <div className="mt-4 md:mt-0 relative">
                    {currentUser !=user.id &&(
                      <button
                        className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span>Edit Role</span>
                      </button>
                    )}
  
                    {openDropdown === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
                        <div className="py-1">
                          {roles
                            .filter((role) => role !== currentRole)
                            .map((roleOption) => (
                              <button
                                key={roleOption}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                                onClick={() => handleRoleChange(user, roleOption)}
                              >
                                {roleOption === 'admin' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                  </svg>
                                )}
                                Make {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
