'use client';
import Swal from 'sweetalert2';

export default function OrgDetailModal({
  org,
  onClose,
  inviteEmail,
  setInviteEmail,
  handleInvite,
  handleRoleChange,
  openDropdown,
  setOpenDropdown,
}) {
  if (!org) return null;

  return (
    <div className="fixed inset-0 z-50 bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{org.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <p className="text-gray-600 mb-4">{org.bio || 'No description available.'}</p>

        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite user by email"
            className="flex-1 border px-3 py-2 rounded"
          />
          <button
            onClick={handleInvite}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Invite
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Users</h3>
          <ul className="divide-y divide-gray-200">
            {org.users?.map((user) => (
              <li key={user.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium">{user.name || user.email}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === user.id ? null : user.id)
                    }
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {user.role}
                  </button>
                  {openDropdown === user.id && (
                    <div className="absolute right-0 mt-1 bg-white border rounded shadow-md z-10">
                      {['admin', 'member', 'viewer'].filter((r) => r !== user.role).map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user, role)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 w-full text-left"
                        >
                          Make {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
