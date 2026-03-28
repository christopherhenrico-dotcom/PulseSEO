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

export interface PageSpeedInfo {
  performanceScore: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  speedIndex: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  mobileUsability: string;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedRecommendations: string[];
}

export interface SEOReportData {
  generatedAt: number;
  dateRange: {
    start: string;
    end: string;
  };
  performance: PerformanceSummary;
  visibility: VisibilityData;
  traffic: TrafficData;
  conversions: ConversionData;
  recommendations: SEORecommendations;
  aiContent: AIGeneratedContent;
  pageSpeed?: PageSpeedInfo;
}

export interface PerformanceSummary {
  summaryText: string;
  metrics: {
    sessions: MetricValue;
    impressions: MetricValue;
    clicks: MetricValue;
    totalUsers: MetricValue;
    newUsers: MetricValue;
    keywordRankings: MetricValue;
    conversions: MetricValue;
  };
  quickWins: string[];
}

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface VisibilityData {
  overview: {
    impressions: MetricValue;
    clicks: MetricValue;
    ctr: MetricValue;
    avgPosition: MetricValue;
  };
  dailyData: DailyMetric[];
  keywordPerformance: KeywordPerformance[];
  brandedKeywords: KeywordPerformance[];
  nonBrandedKeywords: KeywordPerformance[];
}

export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface KeywordPerformance {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  previousPosition: number;
  change: number;
  volume: number;
}

export interface TrafficData {
  summary: {
    sessions: MetricValue;
    users: MetricValue;
    newUsers: MetricValue;
    conversions: MetricValue;
    revenue: MetricValue;
  };
  sessionsByChannel: ChannelData[];
  sessionsByDevice: DeviceData[];
  monthlyTrends: MonthlyTrend[];
  landingPages: LandingPageData[];
}

export interface ChannelData {
  channel: string;
  sessions: number;
  percentage: number;
}

export interface DeviceData {
  device: string;
  sessions: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  sessions: number;
  users: number;
  newUsers: number;
}

export interface LandingPageData {
  path: string;
  sessions: number;
  users: number;
  engagement: number;
  conversions: number;
}

export interface ConversionData {
  summary: {
    conversions: MetricValue;
    transactions: MetricValue;
    revenue: MetricValue;
    conversionRate: MetricValue;
  };
  dailyConversions: DailyConversion[];
  pagePathPerformance: PageConversionData[];
  trafficSourceConversions: SourceConversionData[];
}

export interface DailyConversion {
  date: string;
  conversions: number;
  revenue: number;
}

export interface PageConversionData {
  path: string;
  conversions: number;
  revenue: number;
}

export interface SourceConversionData {
  source: string;
  conversions: number;
  revenue: number;
}

export interface SEORecommendations {
  critical: string[];
  high: string[];
  medium: string[];
  low: string[];
  technical: string[];
  content: string[];
  localSEO: string[];
}

export interface AIGeneratedContent {
  suggestedDescription: string;
  suggestedPosts: string[];
  reviewResponses: { review: string; response: string }[];
  competitorInsights: string;
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
  reportData?: SEOReportData;
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
