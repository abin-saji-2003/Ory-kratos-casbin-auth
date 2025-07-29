'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Inbox } from '@novu/react';
import { UserContext } from '../utils/UserContext';
import Sidebar from '../ui/sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/home`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#FF6584',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.logout_url) {
          window.location.href = data.logout_url;
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-rose-50">
        Loading user info...
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="flex min-h-screen bg-gradient-to-br from-sky-50 to-rose-50">
        {/* Sidebar */}
        <Sidebar/>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <nav className="h-16 flex justify-between items-center px-4 text-gray-800 shadow-sm bg-white/80 backdrop-blur-md border-b border-gray-100">
            <h1 className="text-lg font-bold text-indigo-600">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Inbox
                applicationIdentifier="60krvzGqkO2m"
                subscriberId={user.traits.email}
                styles={{
                  root: { zIndex: 9999 },
                  popover: { zIndex: 9999 },
                  bellButton: { fontSize: '28px', color: '#6C63FF' },
                }}
                routerPush={(path) => router.push(path)}
                appearance={{
                  variables: {
                    colorPrimary: '#6C63FF',
                    colorForeground: '#4A5568',
                  },
                }}
              />
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-4 py-2 rounded-lg hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Page Content */}
          <main className="p-6 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
