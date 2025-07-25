import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { startRegistrationFlow } from '../kratos/flow';
import Swal from 'sweetalert2';

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null); 
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
        startRegistrationFlow(setFlowId, setCsrfToken, setError);
      });
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://localhost:8080/register', {
        email,
        name,
        password,
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Signup Successful!',
          text: 'Now login to continue.',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = '/login';
        });
      })
      .catch((err) => {
        console.error(err);
        setError('Signup failed');
      });
  };

  // Handle Google Sign Up
  const handleGoogleLogin = () => {
    if (!flowId) {
      setError('Registration flow not initialized');
      return;
    }
    window.location.href = `${KRATOS_PUBLIC_URL}/self-service/registration?flow=${flowId}&provider=google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-md w-full">
      <h2 className="text-3xl font-bold text-center text-gray-800 mt-6">Create Account</h2>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
