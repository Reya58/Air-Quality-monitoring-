import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Import Routes and Route for routing
import Login from './login';  // Your Login component
import Register from './register'
import Dashboard from './dashboard';
import { UserProvider } from './context';


function App() {
  return (
    <UserProvider>
      <div className="app">
      
        <Routes>
          {/* Define routes here */}
          <Route path="/" element={<Login />} /> {/* Render Login by default */}
          <Route path="/register" element={<Register />} /> {/* Render Login by default */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Render Login by default */}
        </Routes>
      </div>
      </UserProvider>

  );
}

export default App;
