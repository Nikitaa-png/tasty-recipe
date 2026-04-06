import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

// Map Firebase error codes to friendly messages
const friendlyError = (code) => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':   return 'No account found with this email.';
    case 'auth/wrong-password':        return 'Incorrect password. Try again.';
    case 'auth/invalid-email':         return 'Enter a valid email address.';
    case 'auth/too-many-requests':     return 'Too many attempts. Try again later.';
    case 'auth/user-disabled':         return 'This account has been disabled.';
    default:                           return 'Sign in failed. Please try again.';
  }
};

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAuthError('');
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const fbUser = cred.user;
      onLogin({
        uid:   fbUser.uid,
        email: fbUser.email,
        name:  fbUser.displayName || fbUser.email.split('@')[0],
      });
      navigate('/home');
    } catch (err) {
      setAuthError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (ev) => {
    setForm(f => ({ ...f, [field]: ev.target.value }));
    setErrors(e => ({ ...e, [field]: '' }));
    setAuthError('');
  };

  return (
    <div className="auth-page">
      <button className="theme-toggle auth-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate('/')}>← Back</button>
        <div className="auth-logo">🍴</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Tasty Recipe account</p>

        {authError && (
          <div className="auth-error-box">⚠️ {authError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email} onChange={set('email')}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password" type={showPw ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password} onChange={set('password')}
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : '🔑 Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
