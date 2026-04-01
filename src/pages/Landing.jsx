import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

const FOOD_PARTICLES = [
  { e: '🍛', x: 8,  d: 7  },
  { e: '🫓', x: 18, d: 9  },
  { e: '🍜', x: 28, d: 6  },
  { e: '🥘', x: 38, d: 8  },
  { e: '🍱', x: 52, d: 7  },
  { e: '🍕', x: 62, d: 9  },
  { e: '🥗', x: 72, d: 6  },
  { e: '🍣', x: 82, d: 8  },
  { e: '🍰', x: 92, d: 7  },
  { e: '🌮', x: 5,  d: 10 },
  { e: '🍔', x: 45, d: 8  },
  { e: '🥞', x: 88, d: 6  },
];

const PREVIEW_CARDS = [
  { emoji: '🍛', title: 'Butter Chicken',       meta: '⏱ 40 min · 🍽 4 servings', tag: '🇮🇳 Indian' },
  { emoji: '🥘', title: 'Dal Makhani',           meta: '⏱ 50 min · 🍽 6 servings', tag: '🇮🇳 Indian' },
  { emoji: '🍝', title: 'Spaghetti Carbonara',   meta: '⏱ 30 min · 🍽 2 servings', tag: '🇮🇹 Italian' },
  { emoji: '🍣', title: 'Salmon Sushi Roll',     meta: '⏱ 25 min · 🍽 2 servings', tag: '🇯🇵 Japanese' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Cycle preview cards
  useEffect(() => {
    const t = setInterval(() => setCardIdx(i => (i + 1) % PREVIEW_CARDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`landing ${visible ? 'landing-visible' : ''}`}>

      {/* ── Animated mesh gradient background ── */}
      <div className="landing-mesh" aria-hidden="true" />

      {/* ── Floating food particles ── */}
      <div className="landing-particles" aria-hidden="true">
        {FOOD_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.x}%`,
              animationDuration: `${p.d}s`,
              animationDelay: `${i * 0.5}s`,
              fontSize: `${1.6 + (i % 3) * 0.5}rem`,
            }}
          >
            {p.e}
          </span>
        ))}
      </div>

      {/* ── Theme toggle ── */}
      <button className="theme-toggle landing-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'}
      </button>

      {/* ── Main content ── */}
      <div className="landing-inner">
        <div className="landing-left">

          {/* Badge */}
          <div className="landing-badge">
            <span className="badge-dot" />
            ✨ Discover · Cook · Enjoy
          </div>

          {/* Title */}
          <h1 className="landing-title">
            <span className="title-line-1">Tasty</span>
            <span className="title-line-2">Recipe</span>
            <span className="title-line-3">🍴</span>
          </h1>

          <p className="landing-subtitle">
            Explore <strong>thousands</strong> of delicious recipes from around the world —
            Indian, Italian, Japanese and more. Search, save, and cook something amazing.
          </p>

          {/* CTA buttons */}
          <div className="landing-actions">
            <button className="btn-primary landing-cta" onClick={() => navigate('/login')}>
              🍴 Get Started
            </button>
            <button className="btn-outline" onClick={() => navigate('/signup')}>
              Create Account
            </button>
          </div>

          {/* Feature chips */}
          <div className="landing-chips">
            {[
              ['🔍', 'Search Recipes'],
              ['🇮🇳', 'Indian Dishes'],
              ['❤️', 'Save Favourites'],
              ['🌙', 'Dark Mode'],
              ['📱', 'Responsive'],
            ].map(([icon, label], i) => (
              <div key={label} className="lchip" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: animated preview cards ── */}
        <div className="landing-right">
          {/* Big rotating card */}
          <div className="preview-main-card">
            <div className="pmc-glow" />
            <div className="pmc-emoji">{PREVIEW_CARDS[cardIdx].emoji}</div>
            <div className="pmc-tag">{PREVIEW_CARDS[cardIdx].tag}</div>
            <div className="pmc-title">{PREVIEW_CARDS[cardIdx].title}</div>
            <div className="pmc-meta">{PREVIEW_CARDS[cardIdx].meta}</div>
            <div className="pmc-dots">
              {PREVIEW_CARDS.map((_, i) => (
                <span key={i} className={`pmc-dot ${i === cardIdx ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Floating mini cards */}
          <div className="mini-card mini-1">
            <span>🌶️</span>
            <div>
              <div className="mini-title">Spicy Biryani</div>
              <div className="mini-sub">⭐ 4.9 · 1.2k saves</div>
            </div>
          </div>
          <div className="mini-card mini-2">
            <span>🥗</span>
            <div>
              <div className="mini-title">Greek Salad</div>
              <div className="mini-sub">⭐ 4.7 · 890 saves</div>
            </div>
          </div>
          <div className="mini-card mini-3">
            <span>🍰</span>
            <div>
              <div className="mini-title">Gulab Jamun</div>
              <div className="mini-sub">⭐ 4.8 · 2.1k saves</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom scroll hint ── */}
      <div className="scroll-hint" aria-hidden="true">
        <div className="scroll-mouse"><div className="scroll-wheel" /></div>
      </div>
    </div>
  );
}
