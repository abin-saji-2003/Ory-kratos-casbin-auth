import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserContext } from "../utils/UserContext";

const Organization = () => {
  const user = useContext(UserContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`http://localhost:8080/organization/list`, {
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
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/organization/create',
        {
          organizationName: formData.name,
          bio: formData.bio,
        },
        { withCredentials: true }
      );

      Swal.fire({ icon: 'success', title: 'Organization created', confirmButtonText: 'OK' });
      setFormData({ name: '', bio: '' });
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
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Invitation failed' });
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
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {organizations.length > 0 ? (
        <ul className="space-y-4">
          {organizations.map(org => (
            <li
              key={org.id}
              onClick={() => openOrgDetails(org)}
              className="border border-gray-300 rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
            >
              <h3 className="text-lg font-semibold">{org.name}</h3>
              <p className="text-gray-600">{org.bio}</p>
              <p className="text-sm text-gray-500">Owner: {org.email}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 italic">You are not part of any organization yet.</div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Organization</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Bio</label>
                <input
                  type="text"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedOrg && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">{selectedOrg.name}</h2>
            <p className="text-gray-600 mb-2">{selectedOrg.bio}</p>
            <p className="text-sm text-gray-500 mb-4">Owner: {selectedOrg.email}</p>

            {selectedOrg.role != "reader" && (
              <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Invite Member</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="flex-grow border border-gray-300 px-3 py-2 rounded"
                />
                <button onClick={handleInvite} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Invite
                </button>
              </div>
            </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Members</h3>
              {selectedOrg.users && selectedOrg.users.length > 0 ? (
                <ul className="space-y-3">
                  {selectedOrg.users.map((member, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{member.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Role: {member.role}</p>
                      </div>

                      <div className="relative">
                        { selectedOrg?.role === "admin" &&(
                          <button
                          onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Edit Role</span>
                        </button>
                        ) }
                        
                        {openDropdown === member.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                            {['admin', 'writer', 'reader']
                              .filter(role => role !== member.role) 
                              .map(role => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(member, role)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  {"Make "+role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                              ))}
                          </div>
                        )}

                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No users found in this organization.</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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
