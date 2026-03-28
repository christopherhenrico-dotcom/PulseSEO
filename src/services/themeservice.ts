import { WhiteLabelSettings, DEFAULT_WHITE_LABEL, ColorPalette, ThemeMode } from '../types';

export interface ThemeColors {
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;
  glassShadow: string;
  glassHover: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderHover: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  error: string;
  cardBg: string;
  modalBg: string;
  sidebarBg: string;
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  scoreExcellent: string;
  scoreNeedsWork: string;
  scoreCritical: string;
}

export const lightTheme: ThemeColors = {
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',
  glassShadow: 'rgba(0, 0, 0, 0.05)',
  glassHover: 'rgba(255, 255, 255, 0.85)',
  bgPrimary: '#FAFAFA',
  bgSecondary: '#F5F5F5',
  bgTertiary: '#EFEFEF',
  textPrimary: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  border: 'rgba(0, 0, 0, 0.08)',
  borderHover: 'rgba(0, 0, 0, 0.15)',
  accent: '#000000',
  accentHover: '#262626',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  cardBg: 'rgba(255, 255, 255, 0.6)',
  modalBg: 'rgba(255, 255, 255, 0.9)',
  sidebarBg: 'rgba(255, 255, 255, 0.8)',
  inputBg: 'rgba(255, 255, 255, 0.8)',
  inputBorder: 'rgba(0, 0, 0, 0.08)',
  inputFocus: 'rgba(0, 0, 0, 0.15)',
  scoreExcellent: '#16A34A',
  scoreNeedsWork: '#D97706',
  scoreCritical: '#DC2626',
};

export const darkTheme: ThemeColors = {
  glassBg: 'rgba(30, 30, 30, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',
  glassShadow: 'rgba(0, 0, 0, 0.3)',
  glassHover: 'rgba(40, 40, 40, 0.7)',
  bgPrimary: '#0A0A0A',
  bgSecondary: '#141414',
  bgTertiary: '#1F1F1F',
  textPrimary: '#FAFAFA',
  textSecondary: '#A3A3A3',
  textTertiary: '#525252',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.15)',
  accent: '#FFFFFF',
  accentHover: '#E5E5E5',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  cardBg: 'rgba(30, 30, 30, 0.6)',
  modalBg: 'rgba(20, 20, 20, 0.95)',
  sidebarBg: 'rgba(20, 20, 20, 0.8)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputFocus: 'rgba(255, 255, 255, 0.2)',
  scoreExcellent: '#22C55E',
  scoreNeedsWork: '#F59E0B',
  scoreCritical: '#EF4444',
};

const THEME_STORAGE_KEY = 'lp_theme_mode';
const SETTINGS_STORAGE_KEY = 'lp_settings';

function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateColorsFromPrimary(primary: string): ThemeColors {
  const isLight = isLightColor(primary);
  
  return {
    glassBg: hexToRgba(primary, 0.1),
    glassBorder: hexToRgba(primary, 0.2),
    glassHighlight: hexToRgba(primary, 0.3),
    glassShadow: hexToRgba(primary, 0.05),
    glassHover: hexToRgba(primary, 0.15),
    bgPrimary: isLight ? '#FAFAFA' : '#0A0A0A',
    bgSecondary: isLight ? '#F5F5F5' : '#141414',
    bgTertiary: isLight ? '#EFEFEF' : '#1F1F1F',
    textPrimary: isLight ? '#0A0A0A' : '#FAFAFA',
    textSecondary: isLight ? '#525252' : '#A3A3A3',
    textTertiary: isLight ? '#A3A3A3' : '#525252',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    borderHover: isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
    accent: primary,
    accentHover: adjustBrightness(primary, 0.9),
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    cardBg: hexToRgba(primary, 0.05),
    modalBg: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 10, 10, 0.95)',
    sidebarBg: hexToRgba(primary, 0.08),
    inputBg: hexToRgba(primary, 0.03),
    inputBorder: hexToRgba(primary, 0.15),
    inputFocus: hexToRgba(primary, 0.25),
    scoreExcellent: '#22C55E',
    scoreNeedsWork: '#F59E0B',
    scoreCritical: '#EF4444',
  };
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function adjustBrightness(hex: string, factor: number): string {
  const r = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * factor)));
  const b = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

class ThemeService {
  private currentTheme: ThemeMode = 'dark';
  private customColors: ThemeColors | null = null;
  private listeners: Set<(theme: ThemeMode, colors: ThemeColors) => void> = new Set();

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    // Always use dark mode
    this.currentTheme = 'dark';
    this.applyTheme();
  }

  private getThemeColors(theme: ThemeMode): ThemeColors {
    if (this.customColors) {
      return this.customColors;
    }
    return theme === 'dark' ? darkTheme : lightTheme;
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  getColors(): ThemeColors {
    return this.getThemeColors(this.currentTheme);
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.customColors = null;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme();
    this.notifyListeners();
  }

  applyCustomColors(settings: WhiteLabelSettings): void {
    this.customColors = generateColorsFromPrimary(settings.primaryColor);
    this.applyTheme();
    this.notifyListeners();
  }

  clearCustomColors(): void {
    this.customColors = null;
    this.applyTheme();
    this.notifyListeners();
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const colors = this.getThemeColors(this.currentTheme);
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    root.setAttribute('data-theme', this.currentTheme);
    root.classList.toggle('dark', this.currentTheme === 'dark');
  }

  private notifyListeners(): void {
    const colors = this.getThemeColors(this.currentTheme);
    this.listeners.forEach(listener => listener(this.currentTheme, colors));
  }

  subscribe(listener: (theme: ThemeMode, colors: ThemeColors) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  applyGlassStyles(element: HTMLElement, intensity: 'light' | 'medium' | 'strong' = 'medium'): void {
    const colors = this.getThemeColors(this.currentTheme);
    
    element.style.background = colors.glassBg;
    element.style.backdropFilter = 'blur(20px) saturate(180%)';
    (element.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = 'blur(20px) saturate(180%)';
    element.style.border = `1px solid ${colors.glassBorder}`;
    element.style.boxShadow = `0 8px 32px ${colors.glassShadow}, inset 0 1px 0 ${colors.glassHighlight}`;
  }

  getScoreColorClass(score: number): { text: string; bg: string } {
    const colors = this.getThemeColors(this.currentTheme);
    if (score >= 80) {
      return { text: colors.scoreExcellent, bg: `${colors.scoreExcellent}15` };
    }
    if (score >= 60) {
      return { text: colors.scoreNeedsWork, bg: `${colors.scoreNeedsWork}15` };
    }
    return { text: colors.scoreCritical, bg: `${colors.scoreCritical}15` };
  }

  createGradient(direction: 'primary' | 'subtle' = 'primary'): string {
    const colors = this.getThemeColors(this.currentTheme);
    if (direction === 'primary') {
      return `linear-gradient(135deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 50%, ${colors.bgTertiary} 100%)`;
    }
    return `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`;
  }
}

export const themeService = new ThemeService();
export default themeService;
