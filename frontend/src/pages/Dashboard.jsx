import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const KRATOS_PUBLIC_URL = import.meta.env.VITE_KRATOS_PUBLIC_URL;
  const API_URL=import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/home`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user.traits); 
        console.log(data)
      })
      .catch((err) => {
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${KRATOS_PUBLIC_URL}/self-service/logout/browser`, {
        credentials: "include",
      });
  
      const data = await res.json(); 
      if (data.logout_url) {
        window.location.href = data.logout_url; 
      } else {
        console.error("Logout URL not found in response.");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  
  

  if (!user) return <div>Loading user info...</div>;

  return (
    <div>
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <div className="text-lg font-semibold">Dashboard</div>
        <div className="flex items-center space-x-4">
          <button
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6 flex justify-center h-screen">
        <h2 className="text-3xl font-bold">Welcome {user.name}</h2>
      </main>
    </div>
  );
};

export default Dashboard;
