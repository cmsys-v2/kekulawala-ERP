import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'ocean-dark',
    name: 'Midnight Aurora',
    description: 'Deep space glass · cyan & emerald light',
    preview: 'linear-gradient(135deg, #04070f 30%, #22d3ee 70%, #10b981 100%)',
    dot: 'linear-gradient(135deg, #22d3ee, #3b82f6 55%, #10b981)',
    dark: true,
  },
  {
    id: 'aurora',
    name: 'Emerald Flux',
    description: 'Living green energy · teal & lime',
    preview: 'linear-gradient(135deg, #020a08 30%, #34d399 70%, #a3e635 100%)',
    dot: 'linear-gradient(135deg, #34d399, #a3e635)',
    dark: true,
  },
  {
    id: 'obsidian',
    name: 'Onyx Neon',
    description: 'Black glass · violet & magenta sparks',
    preview: 'linear-gradient(135deg, #06060a 30%, #8b5cf6 70%, #ec4899 100%)',
    dot: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    dark: true,
  },
  {
    id: 'pearl',
    name: 'Daylight Pearl',
    description: 'Airy light mode · sapphire accents',
    preview: 'linear-gradient(135deg, #eef3fa 30%, #2563eb 70%, #059669 100%)',
    dot: 'linear-gradient(135deg, #2563eb, #059669)',
    dark: false,
  },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('erp-theme') || 'ocean-dark';
  });


  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('erp-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, currentTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
