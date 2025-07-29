'use client';

import RoleDropdown from "./RoleDropDown";


export default function UserList({ users = [], currentUserId }) {
  if (!users.length) {
    return <div className="text-center text-gray-500">No users available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <div key={user.id} className="bg-white shadow p-4 rounded-lg border">
          <div className="text-lg font-semibold">{user.traits?.name}</div>
          <div className="text-sm text-gray-500 mb-2">{user.traits?.email}</div>
          <div className="flex justify-between items-center">
            <span className="text-sm bg-gray-200 px-2 py-1 rounded">
              Role: {user.traits?.role}
            </span>
            {user.id !== currentUserId && <RoleDropdown user={user} />}
          </div>
        </div>
      ))}
    </div>
  );
}
