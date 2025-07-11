import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2";
import { Inbox } from '@novu/react';
import { UserContext } from "../utils/UserContext";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/home`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6C63FF", 
      cancelButtonColor: "#FF6584", 
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/logout`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();

        if (data.logout_url) {
          window.location.href = data.logout_url;
        } else {
          console.error("Logout URL not found.");
        }
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
  };
  console.log(user)

  if (!user) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-rose-50">Loading user info...</div>;

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-rose-50 relative">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-4 text-gray-800 z-50 shadow-sm bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div
            onClick={toggleSidebar}
            className="text-xl font-bold flex items-center cursor-pointer hover:text-indigo-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <Inbox
                applicationIdentifier="60krvzGqkO2m"
                subscriberId={user.traits.email}
                styles={{
                  root: { zIndex: 9999 },
                  popover: { zIndex: 9999 },
                  bellButton: {
                    fontSize: "28px",
                    color: "#6C63FF", // Matching the primary color
                  },
                }}
                routerPush={(path) => navigate(path)}
                appearance={{
                  variables: {
                    colorPrimary: "#6C63FF", // Consistent purple
                    colorForeground: "#4A5568", // Soft gray for text
                  },
                }}
              />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow hover:shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              Logout
            </button>
          </div>
        </nav>

        {/* Sidebar */}
        <aside
          className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-white/90 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out overflow-y-auto border-r border-gray-200 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ul className="p-4 space-y-1">
            <li
              onClick={() => navigate("/")}
              className="hover:bg-indigo-50 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Projects
            </li>
            <li
              onClick={() => navigate("/admin/dashboard")}
              className="hover:bg-indigo-50 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </li>
            <li
            onClick={() => navigate("/iam")}
             className="hover:bg-indigo-50 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              IAM
            </li>
            <li
              onClick={() => navigate("/organization")}
              className="hover:bg-indigo-50 p-3 rounded-lg cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Organization
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main
          className={`pt-20 px-6 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </UserContext.Provider>
  );
};

export default Dashboard;