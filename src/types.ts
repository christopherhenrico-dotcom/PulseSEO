/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface FontSettings {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingWeight: number;
  bodyWeight: number;
}

export interface BorderRadius {
  small: string;
  medium: string;
  large: string;
  full: string;
}

export interface Spacing {
  compact: string;
  comfortable: string;
  spacious: string;
}

export interface WhiteLabelSettings {
  brandName: string;
  logoUrl?: string;
  logoDimensions?: { width: number; height: number };
  supportEmail?: string;
  website?: string;
  primaryColor: string;
  theme: 'light' | 'dark' | 'custom';
  colors: ColorPalette;
  fonts: FontSettings;
  borderRadius: BorderRadius;
  spacing: Spacing;
  logoHeight: number;
  showWatermark: boolean;
  customCSS?: string;
}

export type ThemeMode = 'light' | 'dark';

export interface BusinessInfo {
  id?: string;
  name: string;
  category: string;
  website?: string;
  description?: string;
  location: string;
  phone?: string;
  email?: string;
}

export interface AuditResult {
  id: string;
  timestamp: number;
  business: BusinessInfo;
  analysis: AnalysisResult;
  clientId?: string;
}

export interface FrameworkInfo {
  name: string;
  confidence: number;
  renderingMode: 'ssr' | 'ssg' | 'csr' | 'unknown';
  detectedIndicators: string[];
}

export interface ScrapingQuality {
  isComplete: boolean;
  limitations: string[];
  suggestedAction: string;
}

export interface AnalysisResult {
  seoScore: number;
  gmbOptimized: boolean;
  recommendations: string;
  suggestedDescription: string;
  suggestedPosts: string[];
  reviewResponses: {
    review: string;
    response: string;
  }[];
  keywords?: string[];
  competitorInsights?: string;
  frameworkInfo?: FrameworkInfo;
  scrapingQuality?: ScrapingQuality;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: number;
  totalAudits: number;
}

export type View = 'landing' | 'dashboard' | 'audit' | 'settings' | 'report' | 'clients' | 'bulk' | 'templates';

export const DEFAULT_WHITE_LABEL: WhiteLabelSettings = {
  brandName: 'PulseSEO',
  primaryColor: '#000000',
  supportEmail: 'support@pulseseo.com',
  website: 'https://pulseseo.com',
  theme: 'dark',
  colors: {
    primary: '#000000',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    background: '#0A0A0A',
    surface: '#141414',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textMuted: '#525252',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  fonts: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    headingWeight: 600,
    bodyWeight: 400
  },
  borderRadius: {
    small: '6px',
    medium: '12px',
    large: '20px',
    full: '9999px'
  },
  spacing: {
    compact: '8px',
    comfortable: '16px',
    spacious: '24px'
  },
  logoHeight: 48,
  showWatermark: false
};
