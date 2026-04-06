import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const friendlyError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email':        return 'Enter a valid email address.';
    case 'auth/weak-password':        return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':    return 'Too many attempts. Try again later.';
    default:                          return 'Sign up failed. Please try again.';
  }
};

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                          e.name    = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))          e.email   = 'Enter a valid email';
    if (form.password.length < 6)                                  e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)                            e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAuthError('');
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Save display name to Firebase profile
      await updateProfile(cred.user, { displayName: form.name.trim() });
      onLogin({
        uid:   cred.user.uid,
        email: cred.user.email,
        name:  form.name.trim(),
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
        <div className="auth-logo">🍳</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Tasty Recipe and start cooking</p>

        {authError && (
          <div className="auth-error-box">⚠️ {authError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name" type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Gordon Ramsay"
              value={form.name} onChange={set('name')}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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
                autoComplete="new-password"
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm" type="password"
              className={`form-input ${errors.confirm ? 'error' : ''}`}
              placeholder="••••••••"
              value={form.confirm} onChange={set('confirm')}
              autoComplete="new-password"
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : '🚀 Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
