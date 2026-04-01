import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUpdateUser = (updated) => {
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const guard = (el) => user ? el : <Navigate to="/login" />;

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login onLogin={handleLogin} />} />
        <Route path="/signup"    element={<Signup onLogin={handleLogin} />} />
        <Route path="/home"      element={guard(<Home user={user} onLogout={handleLogout} />)} />
        <Route path="/recipe/:id" element={guard(<RecipeDetail user={user} onLogout={handleLogout} />)} />
        <Route path="/profile"   element={guard(<Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />)} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
