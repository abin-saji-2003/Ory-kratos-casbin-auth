'use client';

import { useState, useContext } from 'react';
import { UserContext } from '../../utils/UserContext';
import { useRouter } from 'next/navigation';
import CreateRepoModal from './RepoCreateModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RepoActions({ hasRepos }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useContext(UserContext);
  const router = useRouter();

  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/github/login`;
  };

  const handleCreateRepo = async (repoData) => {
    try {
      const res = await fetch(`${API_URL}/github/repo/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(repoData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.message}`);
        return;
      }

      setIsModalOpen(false);
      router.refresh(); // re-fetch server data
    } catch (err) {
      console.error(err);
      alert('Unexpected error');
    }
  };

  return (
    <>
      {user?.traits.role !== 'reader' && hasRepos && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow hover:shadow-lg transition"
        >
          Create New Repo
        </button>
      )}

      {!hasRepos && (
        <button
          onClick={handleGitHubLogin}
          className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg"
        >
          Connect GitHub
        </button>
      )}

      <CreateRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRepo}
      />
    </>
  );
}
