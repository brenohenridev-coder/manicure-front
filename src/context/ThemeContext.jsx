import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const toggle = () => setDark(p => !p);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
      <button className="dark-toggle" onClick={toggle} title={dark ? 'Modo claro' : 'Modo noturno'}>
        {dark ? '☀️' : '🌙'}
      </button>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
