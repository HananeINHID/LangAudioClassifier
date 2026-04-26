import { useState, useEffect } from 'react';

/**
 * Hook to manage dark mode via a `dark` class on <html>.
 * Persists user choice in localStorage.
 */
export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('dialectid_theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      // fallback: respect OS preference
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dialectid_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
