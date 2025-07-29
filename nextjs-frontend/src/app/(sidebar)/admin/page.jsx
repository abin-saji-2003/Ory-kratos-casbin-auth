import UserList from '../../ui/admin/UserList';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchAdminData() {
  const cookieStore = cookies();
  const kratosSession = cookieStore.get('ory_kratos_session');

  if (!kratosSession) {
    console.error('No session cookie found');
    throw new Error('Unauthorized: No session');
  }

  const res = await fetch(`${API_URL}/admin/dashboard`, {
    headers: {
      Cookie: `ory_kratos_session=${kratosSession.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  return data;
}

export default async function AdminPage() {
  const data = await fetchAdminData();

  if (!data?.users?.length || !data?.current?.id) {
    throw new Error('Incomplete admin data');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Admin <span className="text-indigo-600">Dashboard</span>
        </h1>
        <p className="text-lg text-gray-600 mt-2">User Management</p>
      </div>
      <UserList users={data.users} currentUserId={data.current.id} />
    </div>
  );
}
