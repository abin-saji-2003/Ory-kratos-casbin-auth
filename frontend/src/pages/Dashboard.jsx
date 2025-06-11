import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [repos, setRepos] = useState([])
  //const KRATOS_PUBLIC_URL = import.meta.env.VITE_KRATOS_PUBLIC_URL;
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

  useEffect(()=>{
    const fetchRepos= async ()=>{
      try{
        const res=await fetch(`${API_URL}/github/repos`,{
          method:"GET",
          credentials:"include",
        })
        if (res.ok){
          const data=await res.json()
          setRepos(data)  
        }
      }
      catch (err){
        console.error("Failed to fetch GitHub repos", err)
      }
    }
    fetchRepos()
  },[user])

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
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
          console.error('Logout URL not found in response.');
        }
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
    // if (result.isConfirmed){
    //   try {
    //     const res = await fetch(`${KRATOS_PUBLIC_URL}/self-service/logout/browser`, {
    //       credentials: "include",
    //     });
    
    //     const data = await res.json(); 
    //     if (data.logout_url) {
    //       window.location.href = data.logout_url; 
    //     } else {
    //       console.error("Logout URL not found in response.");
    //     }
    //   } catch (err) {
    //     console.error("Logout failed:", err);
    //   }
    // }
  };

  const handleGoToAdmin =()=>{
    navigate("/admin/dashboard")
  }

  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/github/login`;
  }

  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white shadow-md">
        <div className="text-lg font-semibold">Dashboard</div>
        <div className="flex gap-2">
          <button
            onClick={handleGoToAdmin}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Admin Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>
  
      {/* Main Content */}
      <main className="flex-grow bg-gray-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
            Welcome, {user.name}
          </h2>
  
          {repos.length === 0 && (
            <button
              onClick={handleGitHubLogin}
              className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
              Login with GitHub
            </button>
          )}

        </div>
  
        <section className="w-full max-w-6xl">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Your GitHub Repositories
          </h3>
  
          {repos.length === 0 ? (
            <p className="text-center text-gray-500">No repositories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {repos.map((repo, index) => (
                <div
                key={repo.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <p className="font-medium text-lg text-gray-900">
                  {index + 1}. {repo.name}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>URL:</strong>{" "}
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View on GitHub
                  </a>
                </p>
              </div>
              
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
  
};

export default Dashboard;
