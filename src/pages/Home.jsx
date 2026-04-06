import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import Footer from '../components/Footer';
import { searchRecipes, getPopularRecipes } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

const CATEGORIES = [
  { label: 'Indian',         emoji: '🇮🇳' },
  { label: 'Biryani',        emoji: '🍛' },
  { label: 'Butter Chicken', emoji: '🍗' },
  { label: 'Paneer',         emoji: '🧀' },
  { label: 'Pasta',          emoji: '🍝' },
  { label: 'Sushi',          emoji: '🍣' },
  { label: 'Pizza',          emoji: '🍕' },
  { label: 'Burger',         emoji: '🍔' },
  { label: 'Dessert',        emoji: '🍰' },
  { label: 'Seafood',        emoji: '🦐' },
  { label: 'Salad',          emoji: '🥗' },
  { label: 'Chinese',        emoji: '🥡' },
];

const CUISINES = [
  { flag: '🇮🇳', name: 'Indian',   color: '#ff9933' },
  { flag: '🇮🇹', name: 'Italian',  color: '#009246' },
  { flag: '🇯🇵', name: 'Japanese', color: '#bc002d' },
  { flag: '🇲🇽', name: 'Mexican',  color: '#006847' },
  { flag: '🇨🇳', name: 'Chinese',  color: '#de2910' },
  { flag: '🇬🇷', name: 'Greek',    color: '#0d5eaf' },
  { flag: '🇹🇭', name: 'Thai',     color: '#a51931' },
  { flag: '🇫🇷', name: 'French',   color: '#002395' },
];

const HERO_TIPS = [
  'Search biryani, butter chicken...',
  'Try paneer tikka masala...',
  'How about gulab jamun?',
  'Search pasta carbonara...',
  'Try sushi rolls...',
];

const MORE_SUGGESTIONS = ['Indian', 'Italian', 'Mexican', 'Vegetarian', 'Seafood', 'Dessert'];

const TICKER_ITEMS = [
  'Butter Chicken', 'Dal Makhani', 'Margherita Pizza',
  'Salmon Sushi', 'Street Tacos', 'Carbonara',
  'Chicken Biryani', 'Caesar Salad', 'Smash Burger',
  'Tiramisu', 'Garlic Prawns', 'Falafel Wrap',
];

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function Home({ user, onLogout }) {
  const [searchParams] = useSearchParams();
  const { favorites } = useTheme();

  const [query, setQuery]                   = useState('');
  const [lastQuery, setLastQuery]           = useState('');
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [searchResults, setSearchResults]   = useState([]);
  const [moreResults, setMoreResults]       = useState([]);
  const [loading, setLoading]               = useState(false);
  const [moreLoading, setMoreLoading]       = useState(false);
  const [error, setError]                   = useState('');
  const [activeTab, setActiveTab]           = useState('popular');
  const [searched, setSearched]             = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [heroVisible, setHeroVisible]       = useState(false);

  const resultsRef                    = useRef(null);
  const [statsRef,   statsVisible]    = useReveal(0.2);
  const [cuisineRef, cuisineVisible]  = useReveal(0.1);
  const [gridRef,    gridVisible]     = useReveal(0.05);

  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % HERO_TIPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const loadPopular = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getPopularRecipes(24);
      setPopularRecipes(data);
    } catch (err) {
      const s = err?.response?.status;
      if (s === 401 || s === 403) setError('Invalid API key. Check your .env file.');
      else if (s === 402)         setError('API quota exceeded for today.');
      else                        setError('Could not load recipes. Check your API key.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPopular(); }, [loadPopular]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'favorites' || tab === 'popular') {
      setActiveTab(tab);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [searchParams]);

  const doSearch = async (term) => {
    if (!term.trim()) return;
    setLoading(true); setMoreLoading(false); setError('');
    setSearched(true); setActiveTab('search');
    setLastQuery(term.trim()); setSearchResults([]); setMoreResults([]);
    try {
      const data = await searchRecipes(term.trim(), 16);
      setSearchResults(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      setMoreLoading(true);
      const moreTerm = MORE_SUGGESTIONS[Math.floor(Math.random() * MORE_SUGGESTIONS.length)];
      const more = await searchRecipes(moreTerm, 8);
      const ids = new Set(data.map(r => r.id));
      setMoreResults(more.filter(r => !ids.has(r.id)));
    } catch (e) {
      setError(e?.response?.status === 402 ? 'API quota exceeded.' : 'Search failed. Try again.');
    } finally { setLoading(false); setMoreLoading(false); }
  };

  const handleSearch   = (e) => { e.preventDefault(); doSearch(query); };
  const handleCategory = (label) => { setQuery(label); doSearch(label); };
  const clearSearch    = () => {
    setQuery(''); setLastQuery(''); setSearched(false);
    setSearchResults([]); setMoreResults([]); setActiveTab('popular');
  };

  const displayRecipes =
    activeTab === 'favorites' ? favorites :
    activeTab === 'search'    ? searchResults :
    popularRecipes;

  return (
    <div className="home-page">
      <Navbar user={user} onLogout={onLogout} />

      {/* ── HERO ── */}
      <div className={`home-hero ${heroVisible ? 'hero-visible' : ''}`}>
        <div className="hero-blobs" aria-hidden="true">
          <div className="hblob hblob-1" />
          <div className="hblob hblob-2" />
          <div className="hblob hblob-3" />
        </div>

        <div className="hero-floats" aria-hidden="true">
          {['🍕','🥗','🍜','🍣','🥘','🍰','🌮','🍔'].map((e, i) => (
            <span key={i} className="hfloat" style={{ '--fi': i }}>{e}</span>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-pill">
            <span className="wave-hand">👋</span>
            Hey <strong>{user?.name || 'Chef'}</strong>, ready to cook?
          </div>

          <h1 className="hero-title">
            What are you<br />
            <span className="hero-accent">craving</span> today?
          </h1>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder={HERO_TIPS[placeholderIdx]}
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search recipes"
              />
              {query && (
                <button type="button" className="search-clear" onClick={clearSearch} aria-label="Clear">
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary search-btn">Search</button>
          </form>

          <div className="cat-chips">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                className="cat-chip"
                style={{ '--di': i }}
                onClick={() => handleCategory(cat.label)}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrolling ticker */}
        <div className="ticker-bar" aria-hidden="true">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-item">• {item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-row" ref={statsRef}>
        {[
          { emoji: '📖', num: '1,000+', label: 'Recipes' },
          { emoji: '🌍', num: '20+',    label: 'Cuisines' },
          { emoji: '🍛', num: '🇮🇳',    label: 'Indian Dishes' },
          { emoji: '❤️', num: String(favorites.length || 0), label: 'Your Favourites' },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`stat-card ${statsVisible ? 'stat-in' : ''}`}
            style={{ '--si': i }}
          >
            <span className="stat-emoji">{s.emoji}</span>
            <span className="stat-num">{s.num}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── CUISINES ── */}
      <div className="cuisine-row" ref={cuisineRef}>
        {CUISINES.map((c, i) => (
          <button
            key={c.name}
            className={`cuisine-btn ${cuisineVisible ? 'cuisine-in' : ''}`}
            style={{ '--ci': i, '--cc': c.color }}
            onClick={() => handleCategory(c.name)}
          >
            <span className="cuisine-flag">{c.flag}</span>
            <span className="cuisine-name">{c.name}</span>
          </button>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="home-body" ref={resultsRef}>

        <div className="tabs">
          {[
            { key: 'popular',   label: '🔥 Popular' },
            { key: 'favorites', label: `❤️ Favourites (${favorites.length})` },
            ...(searched ? [{ key: 'search', label: `🔍 "${lastQuery}"` }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="skel-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skel-card" style={{ '--si': i }}>
                <div className="skel-img shimmer" />
                <div className="skel-body">
                  <div className="skel-line shimmer" style={{ width: '80%' }} />
                  <div className="skel-line shimmer" style={{ width: '60%' }} />
                  <div className="skel-line shimmer" style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="err-box">
            <span>⚠️</span>
            <div>
              <strong>Oops!</strong> {error}
              <button className="retry-btn" onClick={loadPopular}>Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'favorites' && favorites.length === 0 && (
          <div className="empty-box">
            <div className="empty-icon">💔</div>
            <h3>No favourites yet</h3>
            <p>Tap the heart on any recipe card to save it here.</p>
          </div>
        )}

        {!loading && !error && activeTab === 'search' && searchResults.length === 0 && searched && (
          <div className="empty-box">
            <div className="empty-icon">🍽️</div>
            <h3>Nothing found</h3>
            <p>No recipes for "{lastQuery}". Try a different keyword.</p>
          </div>
        )}

        {!loading && displayRecipes.length > 0 && (
          <div ref={gridRef}>
            {activeTab === 'search' && (
              <p className="results-label">
                Found <strong>{searchResults.length}</strong> recipes for "<em>{lastQuery}</em>"
              </p>
            )}
            <div className="recipe-grid">
              {displayRecipes.map((r, i) => (
                <div
                  key={r.id}
                  className={`card-wrap ${gridVisible ? 'card-in' : 'card-in'}`}
                  style={{ '--ci': i }}
                >
                  <RecipeCard recipe={r} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'search' && searchResults.length > 0 && (
          <div className="more-section">
            <div className="more-heading">
              <span className="more-icon">✨</span>
              <div>
                <div className="more-title">More dishes to explore</div>
                <div className="more-sub">You might also love these</div>
              </div>
            </div>

            {moreLoading ? (
              <div className="skel-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skel-card" style={{ '--si': i }}>
                    <div className="skel-img shimmer" />
                    <div className="skel-body">
                      <div className="skel-line shimmer" style={{ width: '70%' }} />
                      <div className="skel-line shimmer" style={{ width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : moreResults.length > 0 && (
              <div className="recipe-grid">
                {moreResults.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
              </div>
            )}

            <div className="explore-row">
              <span className="explore-label">Explore more:</span>
              {MORE_SUGGESTIONS.map(s => (
                <button key={s} className="explore-chip" onClick={() => handleCategory(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
