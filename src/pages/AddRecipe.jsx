import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import Navbar from '../components/Navbar';
import './AddRecipe.css';

const CUISINES = ['Indian','Italian','Chinese','Mexican','Japanese','Greek','Thai','French','American','Other'];
const CATEGORIES = ['Breakfast','Lunch','Dinner','Snack','Dessert','Drink','Soup','Salad','Side Dish'];
const DIET_TYPES = ['Vegetarian','Non-Vegetarian','Vegan','Gluten-Free'];

// Validation rules
const FOOD_KEYWORDS = /\b(rice|dal|curry|masala|paneer|chicken|mutton|fish|prawn|egg|bread|roti|naan|pasta|pizza|soup|salad|biryani|pulao|sabzi|sabji|dosa|idli|samosa|paratha|chutney|raita|halwa|kheer|ladoo|barfi|cake|cookie|pie|tart|sauce|gravy|stew|roast|fry|grill|bake|steam|boil|marinate|spice|herb|vegetable|fruit|meat|flour|milk|cream|butter|oil|sugar|salt|pepper|garlic|onion|tomato|potato|carrot|spinach|lentil|bean|pea|corn|mushroom|cheese|yogurt|coconut|ginger|turmeric|cumin|coriander|cardamom|cinnamon|clove|bay|mustard|fennel|saffron|chilli|chili)\b/i;

function validateRecipe(form) {
  const errors = {};

  if (!form.title.trim() || form.title.trim().length < 5)
    errors.title = 'Title must be at least 5 characters';
  else if (form.title.trim().length > 80)
    errors.title = 'Title must be under 80 characters';
  else if (!FOOD_KEYWORDS.test(form.title) && !FOOD_KEYWORDS.test(form.description))
    errors.title = 'Title does not look like a food recipe. Please enter a real dish name.';

  if (!form.description.trim() || form.description.trim().length < 30)
    errors.description = 'Description must be at least 30 characters';

  if (form.ingredients.filter(i => i.trim()).length < 3)
    errors.ingredients = 'Add at least 3 ingredients';

  const validSteps = form.steps.filter(s => s.trim().length > 10);
  if (validSteps.length < 2)
    errors.steps = 'Add at least 2 cooking steps (each at least 10 characters)';

  if (!form.cookTime || isNaN(form.cookTime) || form.cookTime < 1 || form.cookTime > 600)
    errors.cookTime = 'Enter a valid cook time (1–600 minutes)';

  if (!form.servings || isNaN(form.servings) || form.servings < 1 || form.servings > 50)
    errors.servings = 'Enter valid servings (1–50)';

  if (!form.cuisine) errors.cuisine = 'Select a cuisine';
  if (!form.category) errors.category = 'Select a category';
  if (!form.dietType) errors.dietType = 'Select a diet type';

  return errors;
}

export default function AddRecipe({ user, onLogout }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', cuisine: '', category: '', dietType: '',
    cookTime: '', servings: '', imageUrl: '',
    ingredients: ['', '', ''],
    steps: ['', ''],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const setIngredient = (i, val) => {
    const arr = [...form.ingredients];
    arr[i] = val;
    setForm(f => ({ ...f, ingredients: arr }));
    setErrors(er => ({ ...er, ingredients: '' }));
  };

  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, ''] }));
  const removeIngredient = (i) => {
    if (form.ingredients.length <= 3) return;
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));
  };

  const setStep = (i, val) => {
    const arr = [...form.steps];
    arr[i] = val;
    setForm(f => ({ ...f, steps: arr }));
    setErrors(er => ({ ...er, steps: '' }));
  };

  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  const removeStep = (i) => {
    if (form.steps.length <= 2) return;
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRecipe(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await addDoc(collection(db, 'community_recipes'), {
        title:       form.title.trim(),
        description: form.description.trim(),
        cuisine:     form.cuisine,
        category:    form.category,
        dietType:    form.dietType,
        cookTime:    Number(form.cookTime),
        servings:    Number(form.servings),
        imageUrl:    form.imageUrl.trim() || '',
        ingredients: form.ingredients.filter(i => i.trim()),
        steps:       form.steps.filter(s => s.trim()),
        authorId:    auth.currentUser?.uid || '',
        authorName:  user?.name || 'Anonymous',
        authorEmail: user?.email || '',
        likes:       0,
        createdAt:   serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/community'), 1500);
    } catch (err) {
      setErrors({ submit: 'Failed to save recipe. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="add-recipe-page">
      <Navbar user={user} onLogout={onLogout} />
      <div className="success-screen">
        <div className="success-icon">🎉</div>
        <h2>Recipe Submitted!</h2>
        <p>Your recipe is now live for everyone to see.</p>
      </div>
    </div>
  );

  return (
    <div className="add-recipe-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="add-recipe-container">
        <div className="add-recipe-header">
          <h1>🍳 Share Your Recipe</h1>
          <p>Share a real dish with the community. All fields are validated to ensure quality.</p>
        </div>

        <form className="recipe-form" onSubmit={handleSubmit} noValidate>

          {/* Title */}
          <div className="rf-section">
            <h3 className="rf-heading">Basic Info</h3>
            <div className="rf-grid-2">
              <div className="rf-field full">
                <label>Dish Name <span className="req">*</span></label>
                <input
                  type="text" className={`rf-input ${errors.title ? 'err' : ''}`}
                  placeholder="e.g. Butter Chicken, Palak Paneer, Pasta Arrabiata"
                  value={form.title} onChange={set('title')}
                />
                {errors.title && <span className="rf-error">{errors.title}</span>}
              </div>

              <div className="rf-field">
                <label>Cuisine <span className="req">*</span></label>
                <select className={`rf-input ${errors.cuisine ? 'err' : ''}`} value={form.cuisine} onChange={set('cuisine')}>
                  <option value="">Select cuisine</option>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.cuisine && <span className="rf-error">{errors.cuisine}</span>}
              </div>

              <div className="rf-field">
                <label>Category <span className="req">*</span></label>
                <select className={`rf-input ${errors.category ? 'err' : ''}`} value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="rf-error">{errors.category}</span>}
              </div>

              <div className="rf-field">
                <label>Diet Type <span className="req">*</span></label>
                <select className={`rf-input ${errors.dietType ? 'err' : ''}`} value={form.dietType} onChange={set('dietType')}>
                  <option value="">Select type</option>
                  {DIET_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dietType && <span className="rf-error">{errors.dietType}</span>}
              </div>

              <div className="rf-field">
                <label>Cook Time (minutes) <span className="req">*</span></label>
                <input
                  type="number" className={`rf-input ${errors.cookTime ? 'err' : ''}`}
                  placeholder="e.g. 30" min="1" max="600"
                  value={form.cookTime} onChange={set('cookTime')}
                />
                {errors.cookTime && <span className="rf-error">{errors.cookTime}</span>}
              </div>

              <div className="rf-field">
                <label>Servings <span className="req">*</span></label>
                <input
                  type="number" className={`rf-input ${errors.servings ? 'err' : ''}`}
                  placeholder="e.g. 4" min="1" max="50"
                  value={form.servings} onChange={set('servings')}
                />
                {errors.servings && <span className="rf-error">{errors.servings}</span>}
              </div>

              <div className="rf-field full">
                <label>Image URL <span className="optional">(optional)</span></label>
                <input
                  type="url" className="rf-input"
                  placeholder="https://example.com/your-dish-photo.jpg"
                  value={form.imageUrl} onChange={set('imageUrl')}
                />
                <span className="rf-hint">Paste a direct image link. Leave blank to use a default.</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rf-section">
            <h3 className="rf-heading">Description</h3>
            <div className="rf-field">
              <label>About this dish <span className="req">*</span></label>
              <textarea
                className={`rf-input rf-textarea ${errors.description ? 'err' : ''}`}
                placeholder="Describe the dish — its origin, taste, what makes it special... (min 30 characters)"
                rows={3} value={form.description} onChange={set('description')}
              />
              <span className="rf-char">{form.description.length} chars</span>
              {errors.description && <span className="rf-error">{errors.description}</span>}
            </div>
          </div>

          {/* Ingredients */}
          <div className="rf-section">
            <h3 className="rf-heading">Ingredients <span className="req">*</span></h3>
            <p className="rf-sub">Add at least 3 ingredients with quantities (e.g. "2 cups basmati rice")</p>
            {errors.ingredients && <span className="rf-error">{errors.ingredients}</span>}
            <div className="ingredients-list">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="ingredient-row">
                  <span className="ing-num">{i + 1}</span>
                  <input
                    type="text" className="rf-input"
                    placeholder={`e.g. ${['500g chicken breast','2 tbsp butter','1 tsp cumin seeds','3 cloves garlic'][i] || 'ingredient + quantity'}`}
                    value={ing} onChange={e => setIngredient(i, e.target.value)}
                  />
                  <button type="button" className="ing-remove" onClick={() => removeIngredient(i)} aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="add-more-btn" onClick={addIngredient}>+ Add Ingredient</button>
          </div>

          {/* Steps */}
          <div className="rf-section">
            <h3 className="rf-heading">Cooking Steps <span className="req">*</span></h3>
            <p className="rf-sub">Add at least 2 clear steps. Each step should be at least 10 characters.</p>
            {errors.steps && <span className="rf-error">{errors.steps}</span>}
            <div className="steps-list">
              {form.steps.map((step, i) => (
                <div key={i} className="step-row">
                  <div className="step-num-badge">{i + 1}</div>
                  <textarea
                    className="rf-input rf-step-input"
                    placeholder={`Step ${i + 1}: e.g. Heat oil in a pan over medium heat...`}
                    rows={2} value={step}
                    onChange={e => setStep(i, e.target.value)}
                  />
                  <button type="button" className="ing-remove" onClick={() => removeStep(i)} aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="add-more-btn" onClick={addStep}>+ Add Step</button>
          </div>

          {errors.submit && <div className="rf-submit-error">⚠️ {errors.submit}</div>}

          <div className="rf-actions">
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary rf-submit" disabled={loading}>
              {loading ? 'Saving…' : '🚀 Publish Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
