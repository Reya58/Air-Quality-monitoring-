import React, { useState } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [channelId, setChannelId] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('https://e6e7-14-194-176-226.ngrok-free.app/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelId, password, apiKey })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        console.log('Register successful:', data);
        navigate('/dashboard'); // change route as per your project
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMsg('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="echo-title">Echo</div>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Register</h2>

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <label htmlFor="channelId">Channel ID</label>
        <input
          type="text"
          id="channelId"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          required
        />

        <label htmlFor="apiKey">API Key</label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
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

        <button type="submit">Register</button>

        <div className="register-link">
          Account exists? <Link to="/">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
