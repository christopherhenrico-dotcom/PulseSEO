/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WhiteLabelSettings {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  supportEmail?: string;
}

export interface BusinessInfo {
  name: string;
  category: string;
  website?: string;
  description?: string;
  location: string;
}

export interface AuditResult {
  id: string;
  timestamp: number;
  business: BusinessInfo;
  analysis: {
    seoScore: number;
    gmbOptimized: boolean;
    recommendations: string;
    suggestedDescription: string;
    suggestedPosts: string[];
    reviewResponses: {
      review: string;
      response: string;
    }[];
  };
}
