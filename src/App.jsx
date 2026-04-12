import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';
import Community from './pages/Community';
import CommunityDetail from './pages/CommunityDetail';
import AddRecipe from './pages/AddRecipe';
import Legal from './pages/Legal';
import RecipeBot from './components/RecipeBot';
import './App.css';

function App() {
  const [user, setUser]       = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('profile')) || {}; } catch { return {}; }
  });

  // Listen to Firebase auth state — persists across page refreshes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const saved = (() => { try { return JSON.parse(localStorage.getItem('profile')) || {}; } catch { return {}; } })();
        setUser({
          uid:   fbUser.uid,
          email: fbUser.email,
          name:  saved.name || fbUser.displayName || fbUser.email.split('@')[0],
          ...saved,
        });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const handleLogin = (userData) => {
    const merged = { ...profile, ...userData };
    localStorage.setItem('profile', JSON.stringify(merged));
    setProfile(merged);
    setUser(merged);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('profile');
    setProfile({});
    setUser(null);
  };

  const handleUpdateUser = (updated) => {
    localStorage.setItem('profile', JSON.stringify(updated));
    setProfile(updated);
    setUser(updated);
  };

  // Still checking auth state — show nothing to avoid flash
  if (user === undefined) {
    return (
      <ThemeProvider>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="spinner" />
        </div>
      </ThemeProvider>
    );
  }

  const guard = (el) => user ? el : <Navigate to="/login" replace />;

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login onLogin={handleLogin} />} />
        <Route path="/signup"     element={<Signup onLogin={handleLogin} />} />
        <Route path="/home"       element={guard(<Home user={user} onLogout={handleLogout} />)} />
        <Route path="/recipe/:id" element={guard(<RecipeDetail user={user} onLogout={handleLogout} />)} />
        <Route path="/profile"    element={guard(<Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />)} />
        <Route path="/community"  element={guard(<Community user={user} onLogout={handleLogout} />)} />
        <Route path="/community/:id" element={guard(<CommunityDetail user={user} onLogout={handleLogout} />)} />
        <Route path="/add-recipe" element={guard(<AddRecipe user={user} onLogout={handleLogout} />)} />
        <Route path="/privacy"    element={<Legal page="privacy" user={user} onLogout={handleLogout} />} />
        <Route path="/terms"      element={<Legal page="terms"   user={user} onLogout={handleLogout} />} />
        <Route path="/contact"    element={<Legal page="contact" user={user} onLogout={handleLogout} />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
      {user && <RecipeBot />}
    </ThemeProvider>
  );
}

export default App;
