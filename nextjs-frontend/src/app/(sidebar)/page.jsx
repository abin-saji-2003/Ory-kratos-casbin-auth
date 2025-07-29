'use client';

import { useEffect, useState, useContext } from 'react';
import RepoGrid from '../ui/repo/RepoGrid';
import RepoActions from '../ui/repo/RepoActions';
import { UserContext } from '../utils/UserContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProjectPage() {
  const [repos, setRepos] = useState([]);
  const user = useContext(UserContext);

  const fetchRepos = async () => {
    try {
      const res = await fetch(`${API_URL}/github/repos`, {
        credentials: 'include',
      });
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error('Error fetching repos:', err);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold">GitHub Repositories</h2>
        <RepoActions hasRepos={repos.length > 0} refreshRepos={fetchRepos} />
      </div>

      <RepoGrid repos={repos} />
    </div>
  );
}
