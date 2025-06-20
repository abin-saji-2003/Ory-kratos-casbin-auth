import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { startLoginFlow } from '../kratos/flow';

function Login() {
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const KRATOS_PUBLIC_URL = import.meta.env.VITE_KRATOS_PUBLIC_URL;

  useEffect(() => {
    axios
      .get(`${KRATOS_PUBLIC_URL}/sessions/whoami`, {
        withCredentials: true,
      })
      .then((res) => {
        const userId = res.data.identity.id;
        console.log("here")
        console.log(userId)
  
        axios.post('http://localhost:8080/assign-role', {
          userId: userId,
          role: 'reader'
        }, {
          withCredentials: true
        })
        .then(() => {
          console.log("Role assigned");
          navigate('/');
        })
        .catch((err) => {
          console.error("Role assignment failed", err);
          navigate('/');
        });
      })
      .catch(() => {
        setCheckingAuth(false);
        startLoginFlow(setFlowId, setCsrfToken, setError);
      });
  }, [navigate]);

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

    axios
      .post(`${KRATOS_PUBLIC_URL}/self-service/login?flow=${flowId}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
      .then(() => {
        console.log('Login successful');
        navigate('/');
      })
      .catch((err) => {
        setError('Login failed. Check your credentials.');
      });
  };

  const handleGoogleLogin = () => {
    if (!flowId) {
      setError('Login flow not initialized');
      return;
    }
    window.location.href = `${KRATOS_PUBLIC_URL}/self-service/login?flow=${flowId}&provider=google`
  };

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="identifier">
              Email
            </label>
            <input
              id="identifier"
              type="email"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
  
          <input type="hidden" name="csrf_token" value={csrfToken} />

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
  
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Login
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200 mb-6"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google logo" 
            className="w-5 h-5"
          />
          Continue with Google
        </button>
  
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;