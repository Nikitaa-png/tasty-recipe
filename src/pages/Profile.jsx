import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import './Profile.css';

const AVATARS = ['👨‍🍳','👩‍🍳','🧑‍🍳','👨‍🦱','👩‍🦰','🧔','👱‍♀️','🧑‍🦳'];

export default function Profile({ user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useTheme();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('info'); // 'info' | 'favorites'

  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    gender:  user?.gender  || '',
    age:     user?.age     || '',
    bio:     user?.bio     || '',
    avatar:  user?.avatar  || '👨‍🍳',
    location: user?.location || '',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email';
    if (form.phone && !form.phone.match(/^\+?[\d\s\-()]{7,15}$/)) e.phone = 'Invalid phone number';
    if (form.age && (isNaN(form.age) || form.age < 1 || form.age > 120)) e.age = 'Enter a valid age';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const updated = { ...user, ...form };
    localStorage.setItem('user', JSON.stringify(updated));
    onUpdateUser(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setForm({
      name:     user?.name     || '',
      email:    user?.email    || '',
      phone:    user?.phone    || '',
      gender:   user?.gender   || '',
      age:      user?.age      || '',
      bio:      user?.bio      || '',
      avatar:   user?.avatar   || '👨‍🍳',
      location: user?.location || '',
    });
    setErrors({});
    setEditing(false);
  };

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="profile-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="profile-container">

        {/* ── Left: Avatar card ── */}
        <aside className="profile-sidebar">
          <div className="avatar-card">
            <div className="avatar-wrap">
              <div className="avatar-display">
                {Array.from(form.avatar).length <= 2 ? form.avatar : initials}
              </div>
              {editing && (
                <div className="avatar-picker">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      className={`avatar-opt ${form.avatar === a ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, avatar: a }))}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <h2 className="profile-name">{form.name || 'Your Name'}</h2>
            <p className="profile-email">{form.email || 'your@email.com'}</p>

            {form.location && (
              <p className="profile-location">📍 {form.location}</p>
            )}

            {form.bio && !editing && (
              <p className="profile-bio">"{form.bio}"</p>
            )}

            <div className="profile-stats">
              <div className="pstat">
                <span className="pstat-num">{favorites.length}</span>
                <span className="pstat-label">Saved</span>
              </div>
              <div className="pstat-divider" />
              <div className="pstat">
                <span className="pstat-num">{form.age || '—'}</span>
                <span className="pstat-label">Age</span>
              </div>
              <div className="pstat-divider" />
              <div className="pstat">
                <span className="pstat-num">{form.gender ? form.gender[0].toUpperCase() : '—'}</span>
                <span className="pstat-label">Gender</span>
              </div>
            </div>

            {!editing ? (
              <button className="btn-primary edit-btn" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-primary" onClick={handleSave}>💾 Save</button>
                <button className="btn-outline" onClick={handleCancel}>Cancel</button>
              </div>
            )}

            {saved && (
              <div className="save-toast">✅ Profile saved!</div>
            )}
          </div>

          {/* Section switcher */}
          <div className="profile-nav">
            <button
              className={`pnav-btn ${activeSection === 'info' ? 'active' : ''}`}
              onClick={() => setActiveSection('info')}
            >
              👤 My Info
            </button>
            <button
              className={`pnav-btn ${activeSection === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveSection('favorites')}
            >
              ❤️ Favourites
              {favorites.length > 0 && <span className="pnav-badge">{favorites.length}</span>}
            </button>
          </div>
        </aside>

        {/* ── Right: Content ── */}
        <main className="profile-main">

          {/* ── Info / Edit form ── */}
          {activeSection === 'info' && (
            <div className="profile-info-section fade-in-up">
              <h3 className="section-heading">Personal Information</h3>

              <div className="info-grid">
                <Field label="Full Name" icon="👤" error={errors.name}>
                  {editing
                    ? <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={set('name')} placeholder="Your full name" />
                    : <span className="info-value">{form.name || <em>Not set</em>}</span>
                  }
                </Field>

                <Field label="Email" icon="📧" error={errors.email}>
                  {editing
                    ? <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={set('email')} placeholder="you@example.com" />
                    : <span className="info-value">{form.email || <em>Not set</em>}</span>
                  }
                </Field>

                <Field label="Phone Number" icon="📱" error={errors.phone}>
                  {editing
                    ? <input type="tel" className={`form-input ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={set('phone')} placeholder="+1 234 567 8900" />
                    : <span className="info-value">{form.phone || <em>Not set</em>}</span>
                  }
                </Field>

                <Field label="Age" icon="🎂" error={errors.age}>
                  {editing
                    ? <input type="number" className={`form-input ${errors.age ? 'error' : ''}`} value={form.age} onChange={set('age')} placeholder="25" min="1" max="120" />
                    : <span className="info-value">{form.age || <em>Not set</em>}</span>
                  }
                </Field>

                <Field label="Gender" icon="🧬">
                  {editing
                    ? (
                      <div className="gender-options">
                        {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                          <button
                            key={g}
                            type="button"
                            className={`gender-chip ${form.gender === g ? 'selected' : ''}`}
                            onClick={() => setForm(f => ({ ...f, gender: g }))}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    )
                    : <span className="info-value">{form.gender || <em>Not set</em>}</span>
                  }
                </Field>

                <Field label="Location" icon="📍">
                  {editing
                    ? <input className="form-input" value={form.location} onChange={set('location')} placeholder="City, Country" />
                    : <span className="info-value">{form.location || <em>Not set</em>}</span>
                  }
                </Field>

                <Field label="Bio" icon="📝" fullWidth>
                  {editing
                    ? <textarea className="form-input bio-input" value={form.bio} onChange={set('bio')} placeholder="Tell us a little about yourself…" rows={3} />
                    : <span className="info-value">{form.bio || <em>Not set</em>}</span>
                  }
                </Field>
              </div>

              {editing && (
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSave}>💾 Save Changes</button>
                  <button className="btn-outline" onClick={handleCancel}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* ── Favourites ── */}
          {activeSection === 'favorites' && (
            <div className="profile-favs-section fade-in-up">
              <h3 className="section-heading">
                ❤️ My Favourite Recipes
                <span className="fav-count-badge">{favorites.length}</span>
              </h3>

              {favorites.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-emoji">💔</div>
                  <h4>No favourites yet</h4>
                  <p>Go explore recipes and tap ❤️ to save them here.</p>
                  <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/home')}>
                    Browse Recipes
                  </button>
                </div>
              ) : (
                <div className="recipe-grid">
                  {favorites.map((r, i) => (
                    <RecipeCard key={r.id} recipe={r} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Small helper component for a labelled field row
function Field({ label, icon, error, fullWidth, children }) {
  return (
    <div className={`info-field ${fullWidth ? 'full-width' : ''}`}>
      <div className="info-label">
        <span>{icon}</span> {label}
      </div>
      <div className="info-content">{children}</div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
