/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PulseSEO AI Service - Local AI with Transformers.js
 */

import { BusinessInfo, FrameworkInfo, ScrapingQuality } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipeline: any = null;
try {
  const transformers = require('@xenova/transformers');
  pipeline = transformers.pipeline;
} catch (e) {
  console.warn('Transformers.js not available, using rule-based AI');
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private generator: any = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    const init = async () => {
      if (!pipeline) {

        this.isInitialized = true;
        return;
      }

      try {
        this.generator = await pipeline('text-generation', 'Xenova/distilgpt2', {
          device: 'webgpu',
          dtype: 'q4',
        });
        
        this.isInitialized = true;
      } catch (e) {
        console.warn('WebGPU failed, trying CPU:', e);
        try {
          this.generator = await pipeline('text-generation', 'Xenova/distilgpt2', {
            device: 'cpu',
          });
          this.isInitialized = true;
        } catch (e2) {
          console.error('AI init failed:', e2);
          this.isInitialized = true;
        }
      }
    };

    this.initPromise = init();
    return this.initPromise;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateWithAI(prompt: string, maxTokens: number = 200): Promise<string> {
    if (!this.generator) {
      return '';
    }

    try {
      const result = await this.generator(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
      });
      
      const output = result[0]?.generated_text || '';
      return output.slice(prompt.length).trim();
    } catch (e) {
      console.warn('AI generation failed:', e);
      return '';
    }
  }

  async generateSEOReport(input: SEOAnalysisInput): Promise<AIReportResult> {
    await this.initialize();

    const { business, scrapedData, frameworkInfo, scrapingQuality } = input;

    let recommendations = this.buildRecommendations(business, scrapedData, frameworkInfo, scrapingQuality);
    let suggestedDescription = this.generateDescription(business, scrapedData);
    let suggestedPosts = this.generatePostIdeas(business, scrapedData);
    let reviewResponses = this.generateReviewResponses(business);
    let keywords = this.extractKeywords(business, scrapedData);
    let competitorInsights = this.generateCompetitorInsights(business);

    if (this.generator && scrapedData) {
      try {
        const aiPrompt = `You are an SEO expert. Provide 3 specific actionable recommendations for improving SEO for a ${business.category} business called "${business.name}" in ${business.location}. Current issues: title="${scrapedData.title}", meta="${scrapedData.metaDescription}", h1s=${scrapedData.h1Tags.length}, wordCount=${scrapedData.wordCount}, hasSchema=${scrapedData.hasSchema}. Be specific and actionable.`;
        
        const aiResult = await this.generateWithAI(aiPrompt, 150);
        if (aiResult) {
          recommendations = `## AI Insights\n\n${aiResult}\n\n---\n\n${recommendations}`;
        }
      } catch (e) {
        console.warn('AI enhancement failed:', e);
      }
    }

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

    if (!hasIssues) {
      recs += '- Great job! Continue publishing quality content regularly\n';
    }

    recs += '\n## Technical Checklist\n\n';
    recs += '- [ ] XML sitemap submitted to Google Search Console\n';
    recs += '- [ ] Robots.txt allows crawling\n';
    recs += '- [ ] Page speed under 3 seconds\n';
    recs += '- [ ] Mobile responsive design\n';
    recs += '- [ ] HTTPS enabled\n';

    return recs;
  }

  private generateDescription(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string {
    return `${business.name} - Professional ${business.category} services in ${business.location}. With years of experience, we deliver quality solutions tailored to your needs. Contact us today!`;
  }

  private generatePostIdeas(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string[] {
    return [
      `🎉 Discover quality ${business.category} services at ${business.name} in ${business.location}! Contact us today!`,
      `📍 Visit ${business.name} - Your trusted ${business.category} expert in ${business.location}. We're here to serve!`,
      `⭐ Thank you for choosing ${business.name}! Your satisfaction is our priority.`
    ];
  }

  private generateReviewResponses(business: BusinessInfo): { review: string; response: string }[] {
    return [
      { review: "Great service!", response: "Thank you so much! We're thrilled to have served you." },
      { review: "It was okay.", response: "Thank you for feedback. We're working to improve." },
      { review: "Disappointed.", response: "We apologize. Please contact us directly to make things right." }
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
      'by', 'an', 'be', 'this', 'that', 'your', 'you', 'are', 'we', 'our'
    ]);
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private generateCompetitorInsights(business: BusinessInfo): string {
    return `## Competitor Analysis\n\n- Complete Google Business Profile\n- Post regularly (3-4x/week)\n- Respond to all reviews within 24 hours\n- Add photos weekly\n- Build local citations\n- Use geo-targeted keywords`;
  }

  private analyzeFramework(framework: FrameworkInfo, quality?: ScrapingQuality): string {
    const advice: Record<string, string[]> = {
      'Next.js': ['Use next/head for meta tags', 'Implement ISR for SEO'],
      'React': ['Use react-helmet for SEO', 'Consider Next.js for SSR'],
      'Vue': ['Use @unhead/vue', 'Consider Nuxt.js for SSR'],
      'WordPress': ['Install Yoast SEO', 'Use SEO-friendly theme'],
    };
    
    return (advice[framework.name] || ['Ensure proper meta tags']).map(i => `- ${i}`).join('\n');
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const aiService = new AIService();
export default aiService;
