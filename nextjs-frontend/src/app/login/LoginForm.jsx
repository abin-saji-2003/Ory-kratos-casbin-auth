'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const KRATOS_PUBLIC_URL = process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL;

export default function LoginForm({ flowId, csrfToken, setError, error }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!flowId) {
      setError('No login flow found.');
      return;
    }

    const data = {
      method: 'password',
      csrf_token: csrfToken,
      identifier,
      password,
    };

    fetch(`${KRATOS_PUBLIC_URL}/self-service/login?flow=${flowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Login failed');
        router.push('/');
      })
      .catch(() => {
        setError('Login failed. Check your credentials.');
      });
  };

  const handleGoogleLogin = () => {
    if (!flowId) {
      setError('Login flow not initialized');
      return;
    }

    window.location.href = `${KRATOS_PUBLIC_URL}/self-service/login?flow=${flowId}&provider=google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="identifier"
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <input type="hidden" name="csrf_token" value={csrfToken} />

          {error && (
            <p className="text-red-600 text-sm text-center -mt-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
