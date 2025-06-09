import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { startRegistrationFlow } from '../kratos/flow';
import Swal from 'sweetalert2';


function Register() {
  const [flowId, setFlowId] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const KRATOS_PUBLIC_URL = import.meta.env.VITE_KRATOS_PUBLIC_URL;

  useEffect(() => {
    axios
      .get(`${KRATOS_PUBLIC_URL}/sessions/whoami`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("Session exists. Redirecting...");
        navigate('/'); 
      })
      .catch(() => {
        startRegistrationFlow(setFlowId, setCsrfToken, setError)
      });
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flowId) return;
  
    const data = {
      method: 'password',
      csrf_token: csrfToken,
      password: password,
      traits: {
        email: email,
        name: name
      }
    };

    axios
      .post(`${KRATOS_PUBLIC_URL}/self-service/registration?flow=${flowId}`, data, {
        withCredentials: true,
      })
      .then((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Signup Successful!',
          text: 'Now login to continue.',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = '/login';
        });
      })
      .catch((err) => {
        console.error('Registration Error:', err);
  
        if (err.response?.data?.ui?.messages?.length > 0) {
          err.response.data.ui.messages.forEach((msg) => {
            setError("Email is already exist")
            console.error(`- ${msg.type}: ${msg.text}`);
          });
        }
  
        if (err.response?.data?.ui?.nodes?.length > 0) {
          err.response.data.ui.nodes.forEach((node) => {
            if (node.messages?.length > 0) {
              node.messages.forEach((msg) => {
                const field = node.attributes?.name || node.group || 'unknown';
                setError("Password is not strong enough") 
                console.error(`- ${field}: ${msg.text}`);
              });
            }
          });
        }
  
        if (!err.response?.data?.ui?.messages?.length && !err.response?.data?.ui?.nodes) {
          console.error('Unknown error:', err.message);
        }
      });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
  
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="traits.name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="traits.email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
  
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Register
          </button>
        </form>
  
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default Register;
