import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Community.css';

export default function Community({ user, onLogout }) {
  const navigate = useNavigate();
  const [recipes, setRecipes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');   // all | veg | nonveg
  const [search, setSearch]     = useState('');

  const NON_VEG = /\b(chicken|mutton|lamb|fish|prawn|shrimp|beef|pork|meat|egg|turkey|duck|crab|tuna|salmon|bacon|keema)\b/i;

  useEffect(() => {
    const q = query(collection(db, 'community_recipes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    await updateDoc(doc(db, 'community_recipes', id), { likes: increment(1) });
  };

  const filtered = recipes.filter(r => {
    const text = `${r.title} ${r.description || ''}`;
    const isNonVeg = NON_VEG.test(text);
    if (filter === 'veg'    && isNonVeg)  return false;
    if (filter === 'nonveg' && !isNonVeg) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="community-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="community-hero">
        <div className="community-hero-content">
          <div className="community-badge">👨‍🍳 Community Kitchen</div>
          <h1>Recipes by Our Community</h1>
          <p>Real dishes shared by real food lovers. Cook, share, inspire.</p>
          <button className="btn-primary add-recipe-cta" onClick={() => navigate('/add-recipe')}>
            + Share Your Recipe
          </button>
        </div>
      </div>

      <div className="community-body">
        {/* Search + filter */}
        <div className="community-controls">
          <div className="comm-search-wrap">
            <span>🔍</span>
            <input
              type="text" placeholder="Search community recipes…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="comm-search"
            />
          </div>
          <div className="comm-filters">
            {[
              { key: 'all',    label: 'All',     icon: '🍽️' },
              { key: 'veg',    label: 'Veg',     icon: '🥦' },
              { key: 'nonveg', label: 'Non-Veg', icon: '🍗' },
            ].map(f => (
              <button
                key={f.key}
                className={`comm-filter-btn ${filter === f.key ? `active ${f.key}` : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="comm-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="comm-skel">
                <div className="comm-skel-img shimmer" />
                <div className="comm-skel-body">
                  <div className="comm-skel-line shimmer" style={{ width: '70%' }} />
                  <div className="comm-skel-line shimmer" style={{ width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="comm-empty">
            <div className="comm-empty-icon">🍽️</div>
            <h3>{recipes.length === 0 ? 'No recipes yet' : 'No results found'}</h3>
            <p>{recipes.length === 0 ? 'Be the first to share a recipe!' : 'Try a different search or filter.'}</p>
            {recipes.length === 0 && (
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/add-recipe')}>
                Share First Recipe
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <p className="comm-count">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''} from the community</p>
            <div className="comm-grid">
              {filtered.map((r, i) => (
                <div
                  key={r.id}
                  className="comm-card fade-in-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/community/${r.id}`)}
                >
                  <div className="comm-card-img-wrap">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.title} className="comm-card-img"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    ) : null}
                    <div className="comm-card-placeholder" style={{ display: r.imageUrl ? 'none' : 'flex' }}>🍽️</div>
                    <div className="comm-card-badges">
                      {r.dietType && (
                        <span className={`comm-badge ${r.dietType === 'Vegetarian' || r.dietType === 'Vegan' ? 'veg' : 'nonveg'}`}>
                          {r.dietType === 'Vegetarian' || r.dietType === 'Vegan' ? '🟢' : '🔴'} {r.dietType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="comm-card-body">
                    <div className="comm-card-meta-top">
                      {r.cuisine && <span className="comm-tag">{r.cuisine}</span>}
                      {r.category && <span className="comm-tag">{r.category}</span>}
                    </div>
                    <h3 className="comm-card-title">{r.title}</h3>
                    <p className="comm-card-desc">{r.description?.slice(0, 80)}…</p>
                    <div className="comm-card-footer">
                      <div className="comm-author">
                        <span className="comm-avatar">{r.authorName?.[0]?.toUpperCase() || '?'}</span>
                        <span>{r.authorName}</span>
                      </div>
                      <div className="comm-card-stats">
                        {r.cookTime && <span>⏱ {r.cookTime}m</span>}
                        {r.servings && <span>🍽 {r.servings}</span>}
                        <button className="comm-like-btn" onClick={e => handleLike(r.id, e)}>
                          ❤️ {r.likes || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
