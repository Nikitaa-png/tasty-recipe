import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Legal.css';

const CONTENT = {
  privacy: {
    icon: '🔒',
    title: 'Privacy Policy',
    updated: 'January 1, 2025',
    sections: [
      {
        heading: 'Information We Collect',
        body: `When you create an account, we collect your name, email address, and password (encrypted via Firebase Authentication). We also store your saved favourite recipes and profile information you choose to provide (age, gender, location, bio).`,
      },
      {
        heading: 'How We Use Your Information',
        body: `We use your information to:\n• Provide and personalise your Tasty Recipe experience\n• Save your favourite recipes and profile settings\n• Display your name in community recipe submissions\n• Improve our app based on usage patterns`,
      },
      {
        heading: 'Data Storage',
        body: `Your account data is stored securely using Google Firebase (Authentication and Firestore). Community recipes you submit are stored in Firestore and visible to all logged-in users. Favourite recipes are stored in your browser's localStorage.`,
      },
      {
        heading: 'Third-Party Services',
        body: `We use the following third-party services:\n• Firebase (Google) — authentication and database\n• TheMealDB — recipe data (no personal data shared)\n• Groq AI — recipe assistant (your messages are sent to Groq's API)\n• Vercel — app hosting`,
      },
      {
        heading: 'Your Rights',
        body: `You can delete your account at any time by contacting us. You can edit or remove your profile information from the Profile page. Community recipes you submit can be removed by contacting us.`,
      },
      {
        heading: 'Cookies',
        body: `We do not use tracking cookies. Firebase may use essential cookies for authentication session management.`,
      },
      {
        heading: 'Contact',
        body: `For privacy-related questions, email us at privacy@tastyrecipe.com`,
      },
    ],
  },

  terms: {
    icon: '📄',
    title: 'Terms of Use',
    updated: 'January 1, 2025',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: `By creating an account and using Tasty Recipe, you agree to these Terms of Use. If you do not agree, please do not use the app.`,
      },
      {
        heading: 'User Accounts',
        body: `You must provide accurate information when creating an account. You are responsible for maintaining the security of your password. You must be at least 13 years old to use this service.`,
      },
      {
        heading: 'Community Recipes',
        body: `When you submit a recipe to the community:\n• You confirm the recipe is real and accurate\n• You grant Tasty Recipe a licence to display it to other users\n• You must not submit offensive, harmful, or plagiarised content\n• We reserve the right to remove any recipe that violates these terms`,
      },
      {
        heading: 'Acceptable Use',
        body: `You agree not to:\n• Submit false, misleading, or harmful content\n• Attempt to hack, scrape, or abuse the platform\n• Use the AI assistant for non-food related harmful purposes\n• Impersonate other users or entities`,
      },
      {
        heading: 'Recipe Data',
        body: `Recipes from TheMealDB are provided under their open database licence. Community recipes are user-generated content. We do not guarantee the accuracy or safety of any recipe — always use your own judgement when cooking.`,
      },
      {
        heading: 'Disclaimer',
        body: `Tasty Recipe is provided "as is" without warranties of any kind. We are not responsible for any allergic reactions, injuries, or damages resulting from following recipes on this platform. Always check ingredients for allergens.`,
      },
      {
        heading: 'Changes to Terms',
        body: `We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.`,
      },
    ],
  },

  contact: {
    icon: '📬',
    title: 'Contact Us',
    updated: null,
    sections: [],
  },
};

export default function Legal({ user, onLogout, page }) {
  const navigate = useNavigate();
  const content = CONTENT[page];

  if (!content) { navigate('/'); return null; }

  if (page === 'contact') {
    return (
      <div className="legal-page">
        <Navbar user={user} onLogout={onLogout} />
        <div className="legal-container">
          <div className="legal-header">
            <span className="legal-icon">📬</span>
            <h1>Contact Us</h1>
            <p>We'd love to hear from you — feedback, bugs, recipe ideas, anything!</p>
          </div>

          <div className="contact-grid">
            <a href="mailto:contact@tastyrecipe.com" className="contact-card">
              <span className="contact-card-icon">📧</span>
              <div className="contact-card-title">Email Us</div>
              <div className="contact-card-value">contact@tastyrecipe.com</div>
              <div className="contact-card-desc">We reply within 24 hours</div>
            </a>

            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="contact-card">
              <span className="contact-card-icon">📸</span>
              <div className="contact-card-title">Instagram</div>
              <div className="contact-card-value">@tastyrecipeapp</div>
              <div className="contact-card-desc">Follow for daily recipes</div>
            </a>

            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="contact-card">
              <span className="contact-card-icon">🐦</span>
              <div className="contact-card-title">Twitter / X</div>
              <div className="contact-card-value">@tastyrecipe</div>
              <div className="contact-card-desc">Updates and announcements</div>
            </a>

            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="contact-card">
              <span className="contact-card-icon">▶️</span>
              <div className="contact-card-title">YouTube</div>
              <div className="contact-card-value">Tasty Recipe</div>
              <div className="contact-card-desc">Cooking tutorials</div>
            </a>
          </div>

          <div className="contact-form-section">
            <h2>Send a Message</h2>
            <ContactForm />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="legal-page">
      <Navbar user={user} onLogout={onLogout} />
      <div className="legal-container">
        <div className="legal-header">
          <span className="legal-icon">{content.icon}</span>
          <h1>{content.title}</h1>
          {content.updated && <p className="legal-updated">Last updated: {content.updated}</p>}
        </div>

        <div className="legal-body">
          {content.sections.map((s, i) => (
            <div key={i} className="legal-section">
              <h2>{s.heading}</h2>
              <p>{s.body.split('\n').map((line, j) => (
                <span key={j}>{line}{j < s.body.split('\n').length - 1 && <br />}</span>
              ))}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // In a real app, send to a backend/email service
    setSent(true);
  };

  const set = (f) => (e) => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    setErrors(prev => ({ ...prev, [f]: '' }));
  };

  if (sent) return (
    <div className="contact-success">
      <div>🎉</div>
      <h3>Message Sent!</h3>
      <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
    </div>
  );

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="cf-row">
        <div className="cf-field">
          <label>Your Name</label>
          <input className={`cf-input ${errors.name ? 'err' : ''}`} placeholder="Gordon Ramsay" value={form.name} onChange={set('name')} />
          {errors.name && <span className="cf-error">{errors.name}</span>}
        </div>
        <div className="cf-field">
          <label>Email Address</label>
          <input type="email" className={`cf-input ${errors.email ? 'err' : ''}`} placeholder="you@example.com" value={form.email} onChange={set('email')} />
          {errors.email && <span className="cf-error">{errors.email}</span>}
        </div>
      </div>
      <div className="cf-field">
        <label>Subject</label>
        <input className={`cf-input ${errors.subject ? 'err' : ''}`} placeholder="Recipe suggestion, bug report, feedback…" value={form.subject} onChange={set('subject')} />
        {errors.subject && <span className="cf-error">{errors.subject}</span>}
      </div>
      <div className="cf-field">
        <label>Message</label>
        <textarea className={`cf-input cf-textarea ${errors.message ? 'err' : ''}`} placeholder="Tell us what's on your mind…" rows={5} value={form.message} onChange={set('message')} />
        {errors.message && <span className="cf-error">{errors.message}</span>}
      </div>
      <button type="submit" className="btn-primary cf-submit">📨 Send Message</button>
    </form>
  );
}

// Need useState for ContactForm
