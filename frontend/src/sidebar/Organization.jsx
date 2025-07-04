import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserContext } from "../utils/UserContext";
import { useLocation } from 'react-router-dom';
import CreateOrganizationModal from '../modal/CreateOrganizationModal';

const Organization = () => {
  const user = useContext(UserContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const [url, setUrl] = useState('');


  useEffect(() => {
    if (location.pathname === "/organization") {
      setUrl("http://localhost:8080/organization/list");
    } else if (location.pathname === "/iam") {
      setUrl("http://localhost:8080/user/organization/list");
    }
  }, [location.pathname]);
  

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
        setError('');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An unexpected error occurred.");
    }
  };


  useEffect(() => {
    if (url) {
      fetchOrganizations();
    }
  }, [url]);

  const handleSubmit = async (orgData) => {
    try {
      await axios.post(
        'http://localhost:8080/organization/create',
        orgData,
        { withCredentials: true }
      );

      Swal.fire({ icon: 'success', title: 'Organization created', confirmButtonText: 'OK' });
      setShowCreateModal(false);
      fetchOrganizations();
    } catch (err) {
      console.error(err);
      setError('Organization creation failed');
    }
  };



  const handleInvite = async () => {
    if (!inviteEmail || !selectedOrg?.id) return;
  
    try {
      await axios.post(
        `http://localhost:8080/organization/${selectedOrg.id}/invite`,
        { email: inviteEmail },
        { withCredentials: true }
      );
  
      Swal.fire({ icon: 'success', title: 'User invited!' });
      setInviteEmail('');
    } catch (err) {
      console.error("Invite error:", err);
  
      const errorMessage =
        err.response?.data?.error || "Invitation failed due to unknown error.";
  
      Swal.fire({
        icon: 'error',
        title: 'Invitation Failed',
        text: errorMessage,
      });
    }
  };
  

  const handleRoleChange = async (member, newRole) => {
    console.log("role",newRole)
    try {
      await axios.put(
        `http://localhost:8080/organization/${selectedOrg.id}/user/${member.id}/role`,
        { new_role: newRole },
        { withCredentials: true }
      );
      Swal.fire({ 
        icon: 'success',
        title: 'Role Updated',
        text: `${member.name || member.email} is now ${newRole}`,
      });

      const updatedUsers = selectedOrg.users.map(u =>
        u.id === member.id ? { ...u, role: newRole } : u
      );
      setSelectedOrg(prev => ({ ...prev, users: updatedUsers }));
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Failed to update role' });
    }

    setOpenDropdown(null);
  };

  const openOrgDetails = (org) => {
    setSelectedOrg(org);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {location.pathname === "/organization" ? "Organizations" : "My Organizations"}
            </h1>
            <p className="text-gray-500 mt-1">
              {location.pathname === "/organization" 
                ? "All organizations you have access to" 
                : "Organizations you manage"}
            </p>
          </div>
          
          {location.pathname === "/iam" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </button>
          )}
        </header>


  
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}


  
        {/* Organizations List */}
        <section>
          {organizations.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {organizations.map(org => (
                <div
                  key={org.id}
                  onClick={() => openOrgDetails(org)}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {org.name}
                      </h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{org.bio}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                      {org.role}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {org.email}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-700">No organizations found</h3>
              <p className="mt-1 text-gray-500">
                {location.pathname === "/iam" 
                  ? "Create your first organization to get started" 
                  : "You haven't been added to any organizations yet"}
              </p>
              {location.pathname === "/iam" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Create Organization
                </button>
              )}
            </div>
          )}
        </section>
      </div>



  
      {/* Create Organization Modal */}
      {showCreateModal && (
        <CreateOrganizationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleSubmit}
        />
      )}



  
      {/* Organization Details Modal */}
      {showDetailsModal && selectedOrg && (
        <div className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedOrg.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedOrg.bio}</p>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Owner: {selectedOrg.email}
              </div>
            </div>
  
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {selectedOrg.role !== "reader" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Invite New Members</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button 
                      onClick={handleInvite}
                      className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Invite
                    </button>
                  </div>
                </div>
              )}
  
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Members ({selectedOrg.users?.length || 0})</h3>
                
                {selectedOrg.users && selectedOrg.users.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrg.users.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                            {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {member.name || member.email}
                              {member.email === selectedOrg.email && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Owner</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{member.name && member.email}</p>
                          </div>
                        </div>
  
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            member.role === 'writer' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role}
                          </span>
                          
                          {selectedOrg?.role === "admin" && member.email !== selectedOrg.email && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              
                              {openDropdown === member.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                  <div className="py-1">
                                    {['admin', 'writer', 'reader']
                                      .filter(role => role !== member.role)
                                      .map(role => (
                                        <button
                                          key={role}
                                          onClick={() => handleRoleChange(member, role)}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                          Make {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </button>
                                      ))}
                                    
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-2">No members in this organization yet</p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      
    </div>
  );
};

export default Organization;
