'use client';
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import OrgDetailModal from './OrgDetailModal';
import CreateOrganizationModal from './CreateOrganizationModal';


export default function OrganizationClient({ organizations: initialOrgs, isIam }) {
  const [organizations, setOrganizations] = useState(initialOrgs);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchOrgs = async () => {
    const endpoint = isIam ? '/organization/user/list' : '/organization/list';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setOrganizations(data.organizations || []);
    }
  };

  const handleCreate = async (orgData) => {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/organization/create`, orgData, {
      withCredentials: true,
    });
    Swal.fire('Organization Created', '', 'success');
    setShowCreate(false);
    await fetchOrgs();
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedOrg?.id) return;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail);
    if (!isValid) return Swal.fire('Invalid Email', '', 'error');

    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/organization/${selectedOrg.id}/invite`,
      { email: inviteEmail },
      { withCredentials: true }
    );
    Swal.fire('User Invited', '', 'success');
    setInviteEmail('');
  };

  const handleRoleChange = async (member, newRole) => {
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/organization/${selectedOrg.id}/user/${member.id}/role`,
      { new_role: newRole }, { withCredentials: true }
    );
    Swal.fire('Role Updated', '', 'success');
    setSelectedOrg((prev) => ({
      ...prev,
      users: prev.users.map((u) => u.id === member.id ? { ...u, role: newRole } : u),
    }));
    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{isIam ? 'My Organizations' : 'Organizations'}</h1>
          <p className="text-gray-600">{isIam ? 'Organizations you manage' : 'All organizations available to you'}</p>
        </div>
        {isIam && (
          <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded shadow">
            Create Organization
          </button>
        )}
      </div>

      {/* Organization Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {organizations.length ? organizations.map((org) => (
          <div
            key={org.id}
            onClick={() => setSelectedOrg(org)}
            className="cursor-pointer bg-white p-4 rounded shadow hover:bg-indigo-50"
          >
            <h3 className="font-bold text-lg">{org.name}</h3>
            <p className="text-sm text-gray-500">{org.bio}</p>
            <span className="mt-2 inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              Role: {org.role}
            </span>
          </div>
        )) : (
          <div className="col-span-2 text-center text-gray-500">No organizations found</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateOrganizationModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    
        <OrgDetailModal
            org={selectedOrg}
            onClose={() => {
                setSelectedOrg(null);
                setInviteEmail('');
        }}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            handleInvite={handleInvite}
            handleRoleChange={handleRoleChange}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
        />

    </div>
  );
}
