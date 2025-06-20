import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import CreateRepoModal from "../modal/CreateRepoModal";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [repos, setRepos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setUser(data.user); 
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
  };

  const handleGoToAdmin =()=>{
    navigate("/admin/dashboard")
  }

  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/github/login`;
  }

  const handleCreateRepo = async (repoData) => {
    try {
      const response = await fetch(`${API_URL}/github/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(repoData),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Repo creation failed:", error.message);
        alert(`Failed to create repo: ${error.message}`);
        return;
      }
  
      const data = await response.json();
      console.log("Repository created:", data);
  
      alert("Repository created successfully!");
  
    } catch (error) {
      console.error("Error creating repository:", error);
      alert("An unexpected error occurred while creating the repository.");
    }
  };


  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          DevDashboard
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGoToAdmin}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Admin
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </nav>
    
      {/* Main Content */}
      <main className="flex-grow p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Welcome,  <span className="text-indigo-600">{user.traits.name}</span>
          </h2>
          <p className="text-lg text-gray-600 mb-6">Manage your GitHub repositories in one place</p>
        </div>
    
        <section className="w-full max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
              Your GitHub Repositories
            </h3>
            
            {user.traits.role !== "reader" && repos.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Repo
              </button>
            )}
          </div>
  
          <CreateRepoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateRepo}
          />
  
          {repos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="text-xl font-medium text-gray-700 mb-2">No repositories found</h4>
              <p className="text-gray-500 mb-4">Connect your GitHub account to view your repositories</p>
              <button
                onClick={handleGitHubLogin}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Connect GitHub
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo, index) => (
                <div
                  key={repo.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-lg text-gray-900 mb-1 flex items-center">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-3">
                          {index + 1}
                        </span>
                          {repo.name}
                        </p>
                      </div>
                      
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View on GitHub
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
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
