/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WhiteLabelSettings {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  supportEmail?: string;
  website?: string;
}

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
