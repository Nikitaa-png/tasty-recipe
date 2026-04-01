import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const toggleFavorite = (recipe) => {
    setFavorites(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      return exists ? prev.filter(r => r.id !== recipe.id) : [...prev, recipe];
    });
  };

  const isFavorite = (id) => favorites.some(r => r.id === id);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, favorites, toggleFavorite, isFavorite }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
