/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AI-powered SEO analysis service using Transformers.js
 */

import { pipeline, env } from '@huggingface/transformers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPipeline = any;
import { BusinessInfo, FrameworkInfo, ScrapingQuality } from '../types';

env.allowLocalModels = false;
env.useBrowserCache = true;

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

class AIService {
  private textGenerator: Awaited<AnyPipeline> | null = null;
  private embeddingModel: Awaited<AnyPipeline> | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    const init = async () => {
      try {
        console.log('Initializing AI models...');
        try {
          this.textGenerator = await pipeline('text-generation', 'Xenova/gpt2', {
            device: 'webgpu',
          });
        } catch (e) {
          console.log('Failed to initialize WebGPU pipeline, falling back to WASM.', e);
          this.textGenerator = await pipeline('text-generation', 'Xenova/distilgpt2', {
            device: 'wasm',
          });
        }
        this.isInitialized = true;
        console.log('AI text generator ready');
      } catch (error) {
        console.error('Failed to initialize AI models:', error);
        // allow retrying
        this.initPromise = null;
        this.isInitialized = false;
        throw error;
      }
    };

    this.initPromise = init();
    return this.initPromise;
  }

  async generateSEOReport(input: SEOAnalysisInput): Promise<AIReportResult> {
    await this.initialize();

    const { business, scrapedData, frameworkInfo, scrapingQuality } = input;

    const [recommendations, description, posts, reviewResponses, keywords, competitorInsights] = await Promise.all([
      this.generateRecommendations(business, scrapedData, frameworkInfo, scrapingQuality),
      this.generateDescription(business, scrapedData),
      this.generatePostIdeas(business, scrapedData),
      this.generateReviewResponses(business),
      this.extractKeywords(business, scrapedData),
      this.generateCompetitorInsights(business)
    ]);

    const result: AIReportResult = {
      recommendations,
      suggestedDescription: description,
      suggestedPosts: posts,
      reviewResponses,
      keywords,
      competitorInsights,
      frameworkAnalysis: frameworkInfo ? this.analyzeFramework(frameworkInfo, scrapingQuality) : undefined
    };

    return result;
  }

  private async generateRecommendations(
    business: BusinessInfo,
    scrapedData: ScrapedDataForAI | null,
    frameworkInfo?: FrameworkInfo,
    scrapingQuality?: ScrapingQuality
  ): Promise<string> {
    const context = this.buildSEOContext(business, scrapedData);
    
    const prompt = `${context}\n\nYou are an expert SEO consultant. Based on the above website audit data, generate a comprehensive SEO recommendations report in markdown format.\n\nThe report should include:\n\n## SEO Recommendations\n- Specific, actionable improvements based on the actual data found\n- Prioritize issues by impact (critical, high, medium, low)\n${frameworkInfo ? `\n## Framework Analysis: ${frameworkInfo.name}\n- Rendering Mode: ${frameworkInfo.renderingMode.toUpperCase()}\n- Detection Confidence: ${frameworkInfo.confidence}%\n- Specific recommendations for this technology stack` : ''}\n${scrapingQuality && !scrapingQuality.isComplete ? '\n## ⚠️ Scraping Limitations\n' + scrapingQuality.limitations.map(l => `- ${l}`).join('\n') : ''}\n\n## Technical Checklist\n- [ ] XML sitemap submitted to Google Search Console\n- [ ] Robots.txt allows crawling\n- [ ] Page speed under 3 seconds\n- [ ] Mobile responsive design\n- [ ] HTTPS enabled\n\nBe specific and data-driven. Reference the actual metrics found during the audit.`;

    return this.generateWithAI(prompt, 500);
  }

  private async generateDescription(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): Promise<string> {
    const currentDesc = scrapedData?.metaDescription || '';
    const existingContent = scrapedData ? 
      `${scrapedData.title} ${scrapedData.h1Tags.join(' ')} ${scrapedData.h2Tags.join(' ')}`.slice(0, 500) : 
      '';

    const prompt = `Generate an optimized Google Business Profile description for:\nBusiness: ${business.name}\nCategory: ${business.category}\nLocation: ${business.location}\nExisting meta description: \"${currentDesc}\"\nContent themes: ${existingContent}\n\nCreate a compelling 350-400 character description that:\n- Includes primary keywords naturally\n- Highlights unique value proposition\n- Mentions location\n- Has clear call-to-action\n- Is professional and trustworthy\n\nReturn ONLY the description, no additional text.`;

    const result = await this.generateWithAI(prompt, 150);
    return result.trim();
  }

  private async generatePostIdeas(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): Promise<string[]> {
    const keywords = scrapedData?.keywords?.slice(0, 5).join(', ') || business.category;

    const prompt = `Generate 3 engaging social media post ideas for a ${business.category} business called \"${business.name}\" in ${business.location}.\n\nPrimary keywords: ${keywords}\n\nEach post should:\n- Be ready to post on Google Business Profile or social media\n- Be 100-200 characters\n- Include relevant emoji\n- Have a clear purpose (awareness, engagement, promotion)\n- Drive customer action\n\nFormat as a JSON array:\n[\"Post 1...\", \"Post 2...\", \"Post 3...\"]\n\nReturn ONLY the JSON array.`;

    const result = await this.generateWithAI(prompt, 300);
    
    try {
      const posts = JSON.parse(result.replace(/\n/g, '').match(/(\[.*\])/s)?.[0] || '[]');
      if (Array.isArray(posts) && posts.length > 0) {
        return posts.slice(0, 3);
      }
    } catch {
      // Fallback parsing
    }
    
    return [
      `🎉 Discover quality ${business.category} services at ${business.name} in ${business.location}! Contact us today for exceptional service.`,
      `📍 Visit ${business.name} - Your trusted ${business.category} expert in ${business.location}. We're here to serve all your needs!`,
      `⭐ Thank you for choosing ${business.name}! Your satisfaction is our priority. Review us on Google to help others discover our ${business.category} services.`
    ];
  }

  private async generateReviewResponses(business: BusinessInfo): Promise<{ review: string; response: string }[]> {
    const prompts = {
      positive: `Customer left a 5-star review: \"Great service and friendly staff!\"\nWrite a professional, appreciative response for ${business.name}.`,
      neutral: `Customer left a 3-star review: \"It was okay, but the wait was a bit long.\"\nWrite a professional, balanced response for ${business.name} that acknowledges the feedback.`,
      negative: `Customer left a 1-star review: \"I was very disappointed with the quality.\"\nWrite a professional, empathetic response for ${business.name} that aims to resolve the issue offline.`
    };

    const [positive, neutral, negative] = await Promise.all([
      this.generateWithAI(prompts.positive, 80),
      this.generateWithAI(prompts.neutral, 80),
      this.generateWithAI(prompts.negative, 80)
    ]);

    return [
      { review: "Great service and friendly staff!", response: positive || "Thank you for your positive feedback! We're delighted you had a great experience." },
      { review: "It was okay, but the wait was a bit long.", response: neutral || "Thank you for your feedback. We apologize for the wait and are working to improve."}, 
      { review: "I was very disappointed with the quality.", response: negative || "We are very sorry to hear about your experience. Please contact us directly so we can make things right." }
    ];
  }

  private async extractKeywords(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): Promise<string[]> {
    const content = scrapedData ? 
      [scrapedData.title, scrapedData.metaDescription, ...scrapedData.h1Tags, ...scrapedData.h2Tags].join(' ').toLowerCase() :
      `${business.name} ${business.category} ${business.location}`.toLowerCase();

    const words = content.replace(/[^\w\s]/g, '').split(/\s+/);
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      'the', 'and', 'a', 'of', 'to', 'in', 'is', 'it', 'for', 'with', 'on', 'at', 
      'by', 'an', 'be', 'this', 'that', 'your', 'you', 'are', 'we', 'our', 'us',
      'our', 'was', 'for', 'not', 'but', 'have', 'has', 'had', 'will', 'can', 'all'
    ]);
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
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

  private async generateCompetitorInsights(business: BusinessInfo): Promise<string> {
    const prompt = `Generate competitor analysis insights for a ${business.category} business called \"${business.name}\" in ${business.location}.\n\nProvide actionable advice on:\n1. How to outrank competitors in local search\n2. Key differentiators to highlight\n3. Common competitor weaknesses to exploit\n4. Local SEO tactics specific to this business type\n\nBe specific and actionable. Return as a concise bullet-point list.`;

    const result = await this.generateWithAI(prompt, 400);
    return result.trim();
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

  private buildSEOContext(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string {
    if (!scrapedData) {
      return `# Website Audit for ${business.name}\n## Business Information\n- Name: ${business.name}\n- Category: ${business.category}\n- Location: ${business.location}\n- Website: ${business.website || 'Not provided'}\n\n## Audit Status\nNo website data available. Please ensure the URL is correct and publicly accessible.`;
    }

    return `# Website Audit for ${business.name}\n## Business Information\n- Name: ${business.name}\n- Category: ${business.category}\n- Location: ${business.location}\n- Website: ${business.website}\n\n## On-Page SEO Metrics\n- Title: \"${scrapedData.title}\" (${scrapedData.title.length} chars ${scrapedData.title.length <= 60 ? '✅' : '❌'})\n- Meta Description: \"${scrapedData.metaDescription}\" (${scrapedData.metaDescription.length} chars ${scrapedData.metaDescription.length <= 160 ? '✅' : '❌'})\n- H1 Tags: ${scrapedData.h1Tags.length} found ${scrapedData.h1Tags.length === 1 ? '✅' : '⚠️'}\n- H2 Tags: ${scrapedData.h2Tags.length} found\n- Word Count: ${scrapedData.wordCount} words ${scrapedData.wordCount >= 300 ? '✅' : '❌'}\n\n## Content Analysis\n- Images: ${scrapedData.images.length} total\n${scrapedData.images.length > 0 ? `- Images with alt text: ${scrapedData.images.filter(i => i.alt).length}/${scrapedData.images.length}` : ''}\n- Internal Links: ${scrapedData.internalLinks}\n- External Links: ${scrapedData.externalLinks}\n- Schema.org/JSON-LD: ${scrapedData.hasSchema ? '✅ Present' : '❌ Missing'}\n\n## Social Meta (Open Graph)\n- OG Title: ${scrapedData.ogTags.ogTitle ? '✅ ' + scrapedData.ogTags.ogTitle : '❌ Missing'}\n- OG Description: ${scrapedData.ogTags.ogDescription ? '✅ Present' : '❌ Missing'}\n- OG Image: ${scrapedData.ogTags.ogImage ? '✅ Present' : '❌ Missing'}\n\n## Keywords\n${scrapedData.keywords.length > 0 ? scrapedData.keywords.join(', ') : 'None detected'}`;
  }

  private async generateWithAI(prompt: string, maxLength: number): Promise<string> {
    if (!this.textGenerator) {
      await this.initialize();
    }

    try {
      const result = await this.textGenerator!(prompt, {
        max_new_tokens: Math.min(maxLength, 500),
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        repetition_penalty: 1.2
      });

      const generated = result[0]?.generated_text || '';
      const response = generated.slice(prompt.length).trim();
      return response || this.getFallbackResponse(prompt);
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('recommendations')) {
      return `## SEO Recommendations\n\n- Add a descriptive title tag (50-60 characters)\n- Write a compelling meta description (150-160 characters)\n- Ensure you have exactly one H1 heading with target keyword\n- Add structured data (JSON-LD schema) for local business\n- Add alt text to all images\n- Expand content to 500+ words\n- Add Open Graph tags for social sharing\n\n## Technical Checklist\n\n- [ ] XML sitemap submitted to Google Search Console\n- [ ] Robots.txt allows crawling\n- [ ] Page speed under 3 seconds\n- [ ] Mobile responsive design\n- [ ] HTTPS enabled`;
    }
    return 'AI generation unavailable. Please try again.';
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const aiService = new AIService();
export default aiService;
