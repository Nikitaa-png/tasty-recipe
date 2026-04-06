import axios from 'axios';

// ── Spoonacular (primary) ──────────────────────────────────────────
const SPOON_KEY = import.meta.env.VITE_SPOONACULAR_KEY || '';
const spoon = axios.create({ baseURL: 'https://api.spoonacular.com' });

// ── TheMealDB (free fallback, no key needed) ───────────────────────
const meal = axios.create({ baseURL: 'https://www.themealdb.com/api/json/v1/1' });

// Convert MealDB format → Spoonacular-like shape so components stay the same
const normalizeMeal = (m) => ({
  id: m.idMeal,
  title: m.strMeal,
  image: m.strMealThumb,
  summary: m.strInstructions?.slice(0, 200) || '',
  readyInMinutes: null,
  servings: null,
  healthScore: 0,
  cuisines: [m.strArea].filter(Boolean),
  dishTypes: [m.strCategory].filter(Boolean),
  extendedIngredients: Array.from({ length: 20 }, (_, i) => {
    const ing = m[`strIngredient${i + 1}`];
    const measure = m[`strMeasure${i + 1}`];
    if (!ing || !ing.trim()) return null;
    return {
      id: i,
      name: ing,
      original: `${measure || ''} ${ing}`.trim(),
      image: `${ing.toLowerCase().replace(/ /g, '_')}.png`,
    };
  }).filter(Boolean),
  analyzedInstructions: [{
    steps: (m.strInstructions || '')
      .split(/\r?\n/)
      .filter(s => s.trim())
      .map((s, i) => ({ number: i + 1, step: s.trim() })),
  }],
  aggregateLikes: 0,
  nutrition: null,
  sourceUrl: m.strSource || '',
  youtubeUrl: m.strYoutube || '',
});

// ── MealDB helpers ─────────────────────────────────────────────────
const mealSearch = async (query) => {
  const beefWords = /\b(beef|pork|bacon|ham|lard|brisket|ribs)\b/i;
  const r = await meal.get('/search.php', { params: { s: query } });
  return (r.data.meals || [])
    .filter(m => !beefWords.test(m.strMeal))
    .map(normalizeMeal);
};

const mealPopular = async () => {
  const beefWords = /\b(beef|pork|bacon|ham|lard|brisket|ribs)\b/i;

  // Step 1: get all Indian dishes from area filter (returns id + title + image)
  const areaRes = await meal.get('/filter.php', { params: { a: 'Indian' } }).catch(() => ({ data: { meals: [] } }));
  const indianList = (areaRes.data.meals || []).filter(m => !beefWords.test(m.strMeal));

  // Step 2: enrich first 20 with full details (image, instructions, etc.)
  const enriched = await Promise.all(
    indianList.slice(0, 20).map(m =>
      meal.get('/lookup.php', { params: { i: m.idMeal } })
        .then(r => r.data.meals?.[0] ? normalizeMeal(r.data.meals[0]) : null)
        .catch(() => ({
          id: m.idMeal, title: m.strMeal, image: m.strMealThumb,
          summary: '', readyInMinutes: null, servings: null, healthScore: 0,
          cuisines: ['Indian'], dishTypes: [],
        }))
    )
  );

  return enriched.filter(Boolean);
};

const mealById = async (id) => {
  const r = await meal.get('/lookup.php', { params: { i: id } });
  const meals = r.data.meals;
  if (!meals || !meals.length) throw new Error('Not found');
  return normalizeMeal(meals[0]);
};

// ── Public API ─────────────────────────────────────────────────────
const isSpoonActive = () => SPOON_KEY && SPOON_KEY !== 'YOUR_API_KEY_HERE';

export const searchRecipes = async (query, number = 12) => {
  if (isSpoonActive()) {
    try {
      const r = await spoon.get('/recipes/complexSearch', {
        params: { query, number, addRecipeInformation: true, apiKey: SPOON_KEY },
      });
      return r.data.results;
    } catch (err) {
      if (err?.response?.status === 402 || err?.response?.status === 401) {
        // quota/key issue — fall through to MealDB
      } else throw err;
    }
  }
  return mealSearch(query);
};

export const getPopularRecipes = async (number = 12) => {
  if (isSpoonActive()) {
    try {
      const r = await spoon.get('/recipes/complexSearch', {
        params: { sort: 'popularity', number, addRecipeInformation: true, apiKey: SPOON_KEY },
      });
      return r.data.results;
    } catch (err) {
      if (err?.response?.status === 402 || err?.response?.status === 401) {
        // fall through
      } else throw err;
    }
  }
  return mealPopular();
};

export const getRecipeById = async (id) => {
  if (isSpoonActive()) {
    try {
      const r = await spoon.get(`/recipes/${id}/information`, {
        params: { includeNutrition: true, apiKey: SPOON_KEY },
      });
      return r.data;
    } catch (err) {
      if (err?.response?.status === 402 || err?.response?.status === 401) {
        // fall through
      } else throw err;
    }
  }
  return mealById(id);
};

export const getSimilarRecipes = async (id, number = 6) => {
  if (isSpoonActive()) {
    try {
      const r = await spoon.get(`/recipes/${id}/similar`, {
        params: { number, apiKey: SPOON_KEY },
      });
      return r.data;
    } catch {
      // fall through
    }
  }
  // MealDB: fetch random meals as "similar"
  const results = await Promise.all(
    Array.from({ length: number }, () => meal.get('/random.php').then(r => {
      const m = r.data.meals?.[0];
      return m ? normalizeMeal(m) : null;
    }).catch(() => null))
  );
  return results.filter(Boolean);
};
