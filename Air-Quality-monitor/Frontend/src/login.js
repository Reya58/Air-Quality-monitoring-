// Login.js
import React, { useState } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from './context'; // Import the custom hook for context

function Login() {
  const [channelId, setChannelId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { setUserChannelId } = useUserContext();  // Get the function to update channelId in context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('https://e6e7-14-194-176-226.ngrok-free.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelId, password })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        console.log('Login successful:', data);
        setUserChannelId(channelId); // Set channelId in the global context
        console.log('Channel ID set in context:', channelId);
        navigate('/dashboard'); // Change route as per your project
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMsg('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="echo-title">Echo</div>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <label htmlFor="channelId">Channel ID</label>
        <input
          type="text"
          id="channelId"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
