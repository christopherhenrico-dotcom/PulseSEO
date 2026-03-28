/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AI-powered SEO analysis service using Tauri backend with local AI model
 */

import { invoke } from '@tauri-apps/api/core';
import { BusinessInfo, FrameworkInfo, ScrapingQuality } from '../types';

export interface SEOAnalysisInput {
  business: BusinessInfo;
  scrapedData: ScrapedDataForAI | null;
  frameworkInfo?: FrameworkInfo;
  scrapingQuality?: ScrapingQuality;
}

export interface ScrapedDataForAI {
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  keywords: string[];
  images: { src: string; alt: string }[];
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  hasSchema: boolean;
  ogTags: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}

export interface AIReportResult {
  recommendations: string;
  suggestedDescription: string;
  suggestedPosts: string[];
  reviewResponses: { review: string; response: string }[];
  keywords: string[];
  competitorInsights: string;
  frameworkAnalysis?: string;
}

interface TauriSEOInput {
  business_name: string;
  business_category: string;
  business_location: string;
  website: string | null;
  title: string | null;
  meta_description: string | null;
  h1_tags: string[];
  h2_tags: string[];
  keywords: string[];
  word_count: number;
  has_schema: boolean;
  internal_links: number;
  external_links: number;
}

interface TauriAIResult {
  recommendations: string;
  suggested_description: string;
  suggested_posts: string[];
  review_responses: { review: string; response: string }[];
  keywords: string[];
  competitor_insights: string;
}

function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

class AIService {
  private isInitialized: boolean = false;
  private isDesktop: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    const init = async () => {
      try {
        this.isDesktop = isTauriAvailable();
        console.log('AI Service: Running in', this.isDesktop ? 'Desktop (Tauri)' : 'Web (Fallback) mode');

        if (this.isDesktop) {
          try {
            await invoke('initialize_ai', { modelPath: 'models/' });
            console.log('AI model loaded successfully');
          } catch (e) {
            console.warn('AI model initialization skipped:', e);
          }
        }

        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        this.isInitialized = true;
      }
    };

    this.initPromise = init();
    return this.initPromise;
  }

  async generateSEOReport(input: SEOAnalysisInput): Promise<AIReportResult> {
    await this.initialize();

    const { business, scrapedData, frameworkInfo, scrapingQuality } = input;

    if (this.isDesktop) {
      try {
        const tauriInput: TauriSEOInput = {
          business_name: business.name,
          business_category: business.category,
          business_location: business.location,
          website: business.website || null,
          title: scrapedData?.title || null,
          meta_description: scrapedData?.metaDescription || null,
          h1_tags: scrapedData?.h1Tags || [],
          h2_tags: scrapedData?.h2Tags || [],
          keywords: scrapedData?.keywords || [],
          word_count: scrapedData?.wordCount || 0,
          has_schema: scrapedData?.hasSchema || false,
          internal_links: scrapedData?.internalLinks || 0,
          external_links: scrapedData?.externalLinks || 0,
        };

        const result = await invoke<TauriAIResult>('generate_seo_report', { input: tauriInput });
        
        return {
          recommendations: result.recommendations,
          suggestedDescription: result.suggested_description,
          suggestedPosts: result.suggested_posts,
          reviewResponses: result.review_responses,
          keywords: result.keywords,
          competitorInsights: result.competitor_insights,
          frameworkAnalysis: frameworkInfo ? this.analyzeFramework(frameworkInfo, scrapingQuality) : undefined
        };
      } catch (e) {
        console.warn('Tauri AI generation failed, using fallback:', e);
      }
    }

    return this.generateFallbackReport(business, scrapedData, frameworkInfo, scrapingQuality);
  }

  private async generateFallbackReport(
    business: BusinessInfo,
    scrapedData: ScrapedDataForAI | null,
    frameworkInfo?: FrameworkInfo,
    scrapingQuality?: ScrapingQuality
  ): Promise<AIReportResult> {
    const recommendations = this.buildRecommendations(business, scrapedData, frameworkInfo, scrapingQuality);
    const suggestedDescription = this.generateDescription(business, scrapedData);
    const suggestedPosts = this.generatePostIdeas(business, scrapedData);
    const reviewResponses = this.generateReviewResponses(business);
    const keywords = this.extractKeywords(business, scrapedData);
    const competitorInsights = this.generateCompetitorInsights(business);

    return {
      recommendations,
      suggestedDescription,
      suggestedPosts,
      reviewResponses,
      keywords,
      competitorInsights,
      frameworkAnalysis: frameworkInfo ? this.analyzeFramework(frameworkInfo, scrapingQuality) : undefined
    };
  }

  private buildRecommendations(
    business: BusinessInfo,
    scrapedData: ScrapedDataForAI | null,
    frameworkInfo?: FrameworkInfo,
    scrapingQuality?: ScrapingQuality
  ): string {
    let recs = '## SEO Recommendations\n\n';
    let hasIssues = false;

    if (!scrapedData?.title) {
      recs += '- Add a descriptive title tag (50-60 characters)\n';
      hasIssues = true;
    } else if (scrapedData.title.length > 60) {
      recs += `- Shorten title tag (currently ${scrapedData.title.length} chars, aim for 50-60)\n`;
      hasIssues = true;
    }

    if (!scrapedData?.metaDescription) {
      recs += '- Add a meta description (150-160 characters)\n';
      hasIssues = true;
    } else if (scrapedData.metaDescription.length > 160) {
      recs += `- Shorten meta description (currently ${scrapedData.metaDescription.length} chars)\n`;
      hasIssues = true;
    }

    if (!scrapedData?.h1Tags.length) {
      recs += '- Add at least one H1 heading with target keyword\n';
      hasIssues = true;
    }

    if (!scrapedData?.hasSchema) {
      recs += '- Add structured data (JSON-LD schema) for local business\n';
      hasIssues = true;
    }

    const imagesWithoutAlt = scrapedData?.images.filter(i => !i.alt).length || 0;
    if (imagesWithoutAlt > 0) {
      recs += `- Add alt text to ${imagesWithoutAlt} images\n`;
      hasIssues = true;
    }

    if ((scrapedData?.wordCount || 0) < 300) {
      recs += `- Expand content (only ${scrapedData?.wordCount || 0} words, aim for 500+)\n`;
      hasIssues = true;
    }

    if (!scrapedData?.ogTags.ogTitle) {
      recs += '- Add Open Graph tags for social sharing\n';
      hasIssues = true;
    }

    if (!hasIssues) {
      recs += '- Great job! Continue publishing quality content regularly\n';
    }

    if (frameworkInfo) {
      recs += `\n## Framework Analysis: ${frameworkInfo.name}\n`;
      recs += `- Rendering Mode: ${frameworkInfo.renderingMode.toUpperCase()}\n`;
      recs += `- Detection Confidence: ${frameworkInfo.confidence}%\n`;
      recs += `\n${this.analyzeFramework(frameworkInfo, scrapingQuality)}\n`;
    }

    if (scrapingQuality && !scrapingQuality.isComplete) {
      recs += `\n## ⚠️ Scraping Limitations\n`;
      recs += scrapingQuality.limitations.map(l => `- ${l}`).join('\n') + '\n';
      recs += `\n${scrapingQuality.suggestedAction}\n`;
    }

    recs += `\n## Technical Checklist\n\n`;
    recs += '- [ ] XML sitemap submitted to Google Search Console\n';
    recs += '- [ ] Robots.txt allows crawling\n';
    recs += '- [ ] Page speed under 3 seconds\n';
    recs += '- [ ] Mobile responsive design\n';
    recs += '- [ ] HTTPS enabled\n';

    return recs;
  }

  private generateDescription(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string {
    const category = business.category.toLowerCase();
    const location = business.location.split(',')[0];
    
    return `${business.name} - Professional ${category} services in ${location}. With years of experience, we deliver quality solutions tailored to your needs. Contact us today for exceptional service and customer satisfaction.`;
  }

  private generatePostIdeas(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string[] {
    const category = business.category.toLowerCase();
    const location = business.location.split(',')[0];
    const name = business.name;

    return [
      `🎉 Discover quality ${category} services at ${name} in ${location}! Contact us today for exceptional service.`,
      `📍 Visit ${name} - Your trusted ${category} expert in ${location}. We're here to serve all your needs!`,
      `⭐ Thank you for choosing ${name}! Your satisfaction is our priority. Review us on Google to help others discover our ${category} services.`
    ];
  }

  private generateReviewResponses(business: BusinessInfo): { review: string; response: string }[] {
    return [
      { review: "Great service and friendly staff!", response: "Thank you so much for the kind words! We're delighted you had a great experience with us. We look forward to seeing you again soon!" },
      { review: "It was okay, but the wait was a bit long.", response: "Thank you for your feedback. We apologize for the wait and are working to improve our service times. We appreciate your patience and hope to serve you better next time." },
      { review: "I was very disappointed with the quality.", response: "We are very sorry to hear about your experience. Please contact us directly so we can make things right. Your satisfaction is our top priority." }
    ];
  }

  private extractKeywords(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string[] {
    const content = scrapedData ? 
      [scrapedData.title, scrapedData.metaDescription, ...scrapedData.h1Tags, ...scrapedData.h2Tags].join(' ').toLowerCase() :
      `${business.name} ${business.category} ${business.location}`.toLowerCase();

    const words = content.replace(/[^\w\s]/g, '').split(/\s+/);
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      'the', 'and', 'a', 'of', 'to', 'in', 'is', 'it', 'for', 'with', 'on', 'at', 
      'by', 'an', 'be', 'this', 'that', 'your', 'you', 'are', 'we', 'our', 'us',
      'was', 'for', 'not', 'but', 'have', 'has', 'had', 'will', 'can', 'all'
    ]);
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);

    const categoryKeyword = business.category.toLowerCase().split(' ')[0];
    const locationKeyword = business.location.split(',')[0].trim().toLowerCase();

    const finalKeywords = [categoryKeyword, locationKeyword];
    topKeywords.forEach(k => {
      if (!finalKeywords.includes(k) && finalKeywords.length < 10) {
        finalKeywords.push(k);
      }
    });

    return finalKeywords.slice(0, 10);
  }

  private generateCompetitorInsights(business: BusinessInfo): string {
    return `## Competitor Analysis for ${business.name}

### How to Outrank Competitors
- Ensure complete Google Business Profile with all fields
- Post regularly (3-4 times per week)
- Respond to all reviews within 24 hours
- Add photos frequently (weekly)

### Key Differentiators to Highlight
- Unique service offerings
- Years of experience / expertise
- Customer testimonials and reviews
- Special promotions or guarantees

### Local SEO Tactics
- Build local citations across directories
- Use geo-targeted keywords in content
- Create location-specific landing pages
- Encourage customer reviews on Google

### Monitor & Track
- Track competitor posting frequency
- Analyze their keywords and content
- Monitor their review responses
- Watch their photo updates`;
  }

  private analyzeFramework(framework: FrameworkInfo, quality?: ScrapingQuality): string {
    const insights: string[] = [];

    const frameworkAdvice: Record<string, { general: string[], ssr: string[], csr: string[] }> = {
      'Next.js': { general: ['Use next/head for dynamic meta tags per page', 'Implement Next.js Image for automatic optimization', 'Consider Incremental Static Regeneration (ISR) for SEO'], ssr: ['Ensure proper getServerSideProps for real-time content'], csr: ['Consider Static Generation or ISR for better SEO performance'] },
      'React': { general: ['Use react-helmet or @unhead/react for meta management', 'Implement server-side rendering with Next.js or Remix', 'Use React.lazy for code splitting'], ssr: ['Meta tags properly rendered on server'], csr: ['Consider adding SSR (Next.js/Remix) for better SEO'] },
      'Vue': { general: ['Use @unhead/vue for SEO meta tags', 'Consider Nuxt.js for universal rendering', 'Ensure proper hydration markers'], ssr: ['SSR properly configured'], csr: ['Consider Nuxt.js for built-in SSR support'] },
      'Angular': { general: ['Use Angular Universal for SSR', 'Implement TransferState for API caching', 'Configure Meta and Title services'], ssr: ['Angular Universal is configured'], csr: ['Add @nguniversal/express-engine for SSR'] },
      'Shopify (Theme)': { general: ['Use Shopify SEO features in admin panel', 'Optimize product images with descriptive filenames', 'Set up custom title templates in preferences'], ssr: [], csr: [] },
      'WordPress': { general: ['Install Yoast SEO or RankMath plugin', 'Use a lightweight, SEO-friendly theme', 'Optimize images with ShortPixel or Smush'], ssr: [], csr: [] },
      'Wix': { general: ['Use Wix SEO Hub for optimization', 'Enable SEO-friendly URLs in settings', 'Add alt text to images via media manager'], ssr: [], csr: [] },
      'Squarespace': { general: ['Use built-in SEO panel per page', 'Enable SSL certificate', 'Configure sitemap in Settings'], ssr: [], csr: [] }
    };

    const advice = frameworkAdvice[framework.name];
    if (advice) {
      insights.push(...advice.general);
      if (framework.renderingMode === 'csr' && advice.csr.length) { insights.push(...advice.csr); }
      else if (framework.renderingMode === 'ssr' && advice.ssr.length) { insights.push(...advice.ssr); }
    }

    if (quality && !quality.isComplete) { insights.push(`⚠️ Content may be incomplete due to ${framework.name}. ${quality.suggestedAction}`); }

    return insights.map(i => `- ${i}`).join('\n');
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  isRunningDesktop(): boolean {
    return this.isDesktop;
  }
}

export const aiService = new AIService();
export default aiService;
