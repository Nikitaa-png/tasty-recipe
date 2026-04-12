import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import { getRecipeById, getSimilarRecipes, searchRecipes } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import './RecipeDetail.css';

export default function RecipeDetail({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useTheme();

  const [recipe, setRecipe] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError('');

    Promise.all([
      getRecipeById(id),
      getSimilarRecipes(id, 6).catch(() => []),
    ])
      .then(async ([data, sim]) => {
        setRecipe(data);
        // Similar recipes from Spoonacular only return id+title, enrich with search
        if (sim.length) {
          const enriched = await searchRecipes(sim[0].title, 6).catch(() => sim);
          setSimilar(enriched.length ? enriched : sim);
        }
      })
      .catch(() => setError('Could not load recipe. Check your API key.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="detail-page">
      <Navbar user={user} onLogout={onLogout} />
      <div className="detail-skeleton">
        {/* Hero skeleton */}
        <div className="ds-hero shimmer" />
        <div className="ds-body">
          <div className="ds-title shimmer" />
          <div className="ds-meta">
            <div className="ds-chip shimmer" />
            <div className="ds-chip shimmer" />
            <div className="ds-chip shimmer" />
          </div>
          <div className="ds-tabs">
            <div className="ds-tab shimmer" />
            <div className="ds-tab shimmer" />
          </div>
          <div className="ds-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="ds-ing shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="detail-page">
      <Navbar user={user} onLogout={onLogout} />
      <div className="detail-error">
        <div className="emoji">😕</div>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/home')}>← Back to Home</button>
      </div>
    </div>
  );

  if (!recipe) return null;

  const fav = isFavorite(recipe.id);
  const nutrients = recipe.nutrition?.nutrients?.slice(0, 6) || [];

  return (
    <div className="detail-page">
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero */}
      <div className="detail-hero fade-in">
        <img src={recipe.image} alt={recipe.title} className="detail-hero-img" />
        <div className="detail-hero-overlay">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="detail-hero-content">
            <div className="detail-tags">
              {recipe.cuisines?.slice(0, 2).map(c => <span key={c} className="tag">{c}</span>)}
              {recipe.dishTypes?.slice(0, 2).map(d => <span key={d} className="tag">{d}</span>)}
            </div>
            <h1 className="detail-title">{recipe.title}</h1>
            <div className="detail-meta">
              {recipe.readyInMinutes && <span>⏱ {recipe.readyInMinutes} min</span>}
              {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
              {recipe.healthScore > 0 && <span>💚 {recipe.healthScore}% healthy</span>}
              {recipe.aggregateLikes > 0 && <span>👍 {recipe.aggregateLikes} likes</span>}
            </div>
            <button
              className={`fav-detail-btn ${fav ? 'active' : ''}`}
              onClick={() => toggleFavorite(recipe)}
            >
              {fav ? '❤️ Saved' : '🤍 Save Recipe'}
            </button>
          </div>
        </div>
      </div>

      <div className="detail-body">
        {/* Summary */}
        {recipe.summary && (
          <div className="detail-summary fade-in-up"
            dangerouslySetInnerHTML={{ __html: recipe.summary }} />
        )}

        {/* Tabs */}
        <div className="detail-tabs">
          {['ingredients', 'instructions', ...(nutrients.length ? ['nutrition'] : [])].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'ingredients' ? '🥕 Ingredients' : tab === 'instructions' ? '📋 Instructions' : '📊 Nutrition'}
            </button>
          ))}
        </div>

        {/* Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="ingredients-grid fade-in-up">
            {recipe.extendedIngredients?.map((ing, i) => (
              <div key={`${ing.id}-${i}`} className="ingredient-chip">
                <img
                  src={`https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`}
                  alt={ing.name}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div className="ing-name">{ing.name}</div>
                  <div className="ing-amount">{ing.original}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {activeTab === 'instructions' && (
          <div className="instructions fade-in-up">
            {recipe.analyzedInstructions?.[0]?.steps?.length ? (
              recipe.analyzedInstructions[0].steps.map(step => (
                <div key={step.number} className="step">
                  <div className="step-num">{step.number}</div>
                  <p className="step-text">{step.step}</p>
                </div>
              ))
            ) : recipe.instructions ? (
              <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
            ) : (
              <p className="no-instructions">No instructions available for this recipe.</p>
            )}
          </div>
        )}

        {/* Nutrition */}
        {activeTab === 'nutrition' && nutrients.length > 0 && (
          <div className="nutrition-grid fade-in-up">
            {nutrients.map(n => (
              <div key={n.name} className="nutrient-card">
                <div className="nutrient-value">{Math.round(n.amount)}<span>{n.unit}</span></div>
                <div className="nutrient-name">{n.name}</div>
                <div className="nutrient-bar">
                  <div className="nutrient-fill" style={{ width: `${Math.min(n.percentOfDailyNeeds, 100)}%` }} />
                </div>
                <div className="nutrient-pct">{Math.round(n.percentOfDailyNeeds)}% daily</div>
              </div>
            ))}
          </div>
        )}

        {/* More dishes */}
        {similar.length > 0 && (
          <div className="more-dishes fade-in-up">
            <h2 className="section-title">🍽 More dishes to explore</h2>
            <div className="recipe-grid">
              {similar.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
