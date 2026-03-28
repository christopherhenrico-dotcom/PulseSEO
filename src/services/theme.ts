const STORAGE_KEY = 'pulseseo_theme';

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  return (saved === 'light' || saved === 'dark') ? saved : 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme(): void {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initTheme(): void {
  applyTheme(getTheme());
}
