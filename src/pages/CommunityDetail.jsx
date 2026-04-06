import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import Navbar from '../components/Navbar';
import './CommunityDetail.css';

export default function CommunityDetail({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'community_recipes', id))
      .then(d => { if (d.exists()) setRecipe({ id: d.id, ...d.data() }); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    await updateDoc(doc(db, 'community_recipes', id), { likes: increment(1) });
    setRecipe(r => ({ ...r, likes: (r.likes || 0) + 1 }));
  };

  if (loading) return (
    <div className="cd-page"><Navbar user={user} onLogout={onLogout} /><div className="spinner" style={{ marginTop: '4rem' }} /></div>
  );
  if (!recipe) return (
    <div className="cd-page">
      <Navbar user={user} onLogout={onLogout} />
      <div className="cd-empty"><div>😕</div><p>Recipe not found.</p><button className="btn-primary" onClick={() => navigate('/community')}>Back to Community</button></div>
    </div>
  );

  return (
    <div className="cd-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="cd-hero">
        {recipe.imageUrl
          ? <img src={recipe.imageUrl} alt={recipe.title} className="cd-hero-img" />
          : <div className="cd-hero-placeholder">🍽️</div>
        }
        <div className="cd-hero-overlay">
          <button className="cd-back" onClick={() => navigate('/community')}>← Community</button>
          <div className="cd-hero-info">
            <div className="cd-tags">
              {recipe.cuisine  && <span className="cd-tag">{recipe.cuisine}</span>}
              {recipe.category && <span className="cd-tag">{recipe.category}</span>}
              {recipe.dietType && <span className={`cd-tag ${recipe.dietType === 'Vegetarian' || recipe.dietType === 'Vegan' ? 'veg' : 'nonveg'}`}>{recipe.dietType}</span>}
            </div>
            <h1 className="cd-title">{recipe.title}</h1>
            <div className="cd-meta">
              {recipe.cookTime && <span>⏱ {recipe.cookTime} min</span>}
              {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
              <span>👨‍🍳 {recipe.authorName}</span>
            </div>
            <button className="cd-like-btn" onClick={handleLike}>❤️ {recipe.likes || 0} Likes</button>
          </div>
        </div>
      </div>

      <div className="cd-body">
        {recipe.description && <p className="cd-description">{recipe.description}</p>}

        <div className="cd-sections">
          <div className="cd-section">
            <h2>🥕 Ingredients</h2>
            <ul className="cd-ingredients">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i}><span className="cd-ing-dot" />{ing}</li>
              ))}
            </ul>
          </div>

          <div className="cd-section">
            <h2>📋 Instructions</h2>
            <div className="cd-steps">
              {recipe.steps?.map((step, i) => (
                <div key={i} className="cd-step">
                  <div className="cd-step-num">{i + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
