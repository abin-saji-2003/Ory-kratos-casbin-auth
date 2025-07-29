export default function RepoGrid({ repos }) {

  if (repos.length === 0 || !Array.isArray(repos)) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p>No repositories found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo, idx) => (
        <div key={repo.id} className="bg-white rounded-xl shadow p-5 group hover:shadow-lg transition">
          <p className="font-bold text-lg mb-2">
            <span className="mr-3 inline-block bg-blue-100 text-blue-800 text-xs px-2 rounded-full">
              {idx + 1}
            </span>
            {repo.name}
          </p>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            View on GitHub →
          </a>
        </div>
      ))}
    </div>
  );
}
