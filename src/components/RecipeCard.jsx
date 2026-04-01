import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './RecipeCard.css';

export default function RecipeCard({ recipe, index = 0 }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useTheme();
  const fav = isFavorite(recipe.id);

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(recipe);
  };

  return (
    <div
      className="recipe-card fade-in-up"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/recipe/${recipe.id}`)}
      aria-label={`View recipe: ${recipe.title}`}
    >
      <div className="card-img-wrap">
        <img
          src={recipe.image || `https://www.themealdb.com/images/media/meals/default.jpg`}
          alt={recipe.title}
          className="card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(135deg, var(--surface2), var(--border))';
          }}
        />
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={handleFav}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {fav ? '❤️' : '🤍'}
        </button>
        {recipe.readyInMinutes && (
          <span className="card-time">⏱ {recipe.readyInMinutes} min</span>
        )}
        {recipe.cuisines?.[0] && (
          <span className="card-cuisine">{recipe.cuisines[0]}</span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{recipe.title}</h3>
        {recipe.summary && (
          <p className="card-desc">
            {recipe.summary.replace(/<[^>]+>/g, '').slice(0, 90)}…
          </p>
        )}
        <div className="card-footer">
          <div className="card-meta">
            {recipe.servings && <span>🍽 {recipe.servings} srv</span>}
            {recipe.healthScore > 0 && <span>💚 {recipe.healthScore}%</span>}
          </div>
          <span className="card-view-hint">View →</span>
        </div>
      </div>
    </div>
  );
}
