'use client';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const roles = ['admin', 'writer', 'reader'];

export default function RoleDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const currentRole = user.traits.role;

  const changeRole = async (newRole) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ new_role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Role Updated',
          text: `${user.traits.name} is now ${newRole}`,
          confirmButtonColor: '#3085d6',
        });
        router.refresh();
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message,
        confirmButtonColor: '#d33',
      });
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow"
      >
        Edit Role
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
          {roles.filter((r) => r !== currentRole).map((r) => (
            <button
              key={r}
              onClick={() => changeRole(r)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              {r === 'admin' ? (
                <span className="text-blue-500">★</span>
              ) : (
                <span className="text-gray-400">•</span>
              )}
              Make {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
