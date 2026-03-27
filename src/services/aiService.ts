/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AI-powered SEO analysis service using Transformers.js
 */

import { pipeline, env, FeatureExtractionPipeline } from '@huggingface/transformers';
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

type GenerationPipeline = Awaited<ReturnType<typeof pipeline>>;

class AIService {
  private textGenerator: GenerationPipeline | null = null;
  private embeddingModel: FeatureExtractionPipeline | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('Initializing AI models...');
        
        // Use a lightweight text generation model optimized for browser
        this.textGenerator = await pipeline(
          'text-generation',
          'Xenova/gpt2', // Fast, works well in browser
          { device: 'webgpu' }
        ).catch(() => 
          pipeline(
            'text-generation', 
            'Xenova/distilgpt2', // Fallback
            { device: 'wasm' }
          )
        );

        console.log('AI text generator ready');
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  async generateSEOReport(input: SEOAnalysisInput): Promise<AIReportResult> {
    await this.initialize();

    const { business, scrapedData, frameworkInfo, scrapingQuality } = input;

    // Generate report sections using AI
    const [recommendations, description, posts, reviewResponses, keywords, competitorInsights] = await Promise.all([
      this.generateRecommendations(business, scrapedData, frameworkInfo, scrapingQuality),
      this.generateDescription(business, scrapedData),
      this.generatePostIdeas(business, scrapedData),
      this.generateReviewResponses(),
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
    
    const prompt = `${context}

You are an expert SEO consultant. Based on the above website audit data, generate a comprehensive SEO recommendations report in markdown format.

The report should include:

## SEO Recommendations
- Specific, actionable improvements based on the actual data found
- Prioritize issues by impact (critical, high, medium, low)
${frameworkInfo ? `\n## Framework Analysis: ${frameworkInfo.name}
- Rendering Mode: ${frameworkInfo.renderingMode.toUpperCase()}
- Detection Confidence: ${frameworkInfo.confidence}%
- Specific recommendations for this technology stack` : ''}
${scrapingQuality && !scrapingQuality.isComplete ? '\n## ⚠️ Scraping Limitations\n' + scrapingQuality.limitations.map(l => `- ${l}`).join('\n') : ''}

## Technical Checklist
- [ ] XML sitemap submitted to Google Search Console
- [ ] Robots.txt allows crawling
- [ ] Page speed under 3 seconds
- [ ] Mobile responsive design
- [ ] HTTPS enabled

Be specific and data-driven. Reference the actual metrics found during the audit.`;

    return this.generateWithAI(prompt, 500);
  }

  private async generateDescription(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): Promise<string> {
    const currentDesc = scrapedData?.metaDescription || '';
    const existingContent = scrapedData ? 
      `${scrapedData.title} ${scrapedData.h1Tags.join(' ')} ${scrapedData.h2Tags.join(' ')}`.slice(0, 500) : 
      '';

    const prompt = `Generate an optimized Google Business Profile description for:
Business: ${business.name}
Category: ${business.category}
Location: ${business.location}
Existing meta description: "${currentDesc}"
Content themes: ${existingContent}

Create a compelling 350-400 character description that:
- Includes primary keywords naturally
- Highlights unique value proposition
- Mentions location
- Has clear call-to-action
- Is professional and trustworthy

Return ONLY the description, no additional text.`;

    const result = await this.generateWithAI(prompt, 150);
    return result.trim();
  }

  private async generatePostIdeas(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): Promise<string[]> {
    const keywords = scrapedData?.keywords?.slice(0, 5).join(', ') || business.category;

    const prompt = `Generate 3 engaging social media post ideas for a ${business.category} business called "${business.name}" in ${business.location}.

Primary keywords: ${keywords}

Each post should:
- Be ready to post on Google Business Profile or social media
- Be 100-200 characters
- Include relevant emoji
- Have a clear purpose (awareness, engagement, promotion)
- Drive customer action

Format as a JSON array:
["Post 1...", "Post 2...", "Post 3..."]

Return ONLY the JSON array.`;

    const result = await this.generateWithAI(prompt, 300);
    
    try {
      const posts = JSON.parse(result);
      if (Array.isArray(posts) && posts.length === 3) {
        return posts;
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

  private async generateReviewResponses(): Promise<{ review: string; response: string }[]> {
    return [
      { 
        review: "Great service and friendly staff!", 
        response: "Thank you so much for the kind words! We're thrilled to have served you and look forward to seeing you again soon." 
      },
      { 
        review: "Very professional, would recommend.", 
        response: "We appreciate your recommendation! It was our pleasure to help. Don't hesitate to reach out if you need anything in the future." 
      },
      { 
        review: "Amazing experience, will return!", 
        response: "We're so glad you had an amazing experience! Our team takes pride in delivering excellence every time. Can't wait to welcome you back!" 
      }
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

    // Ensure business category and location are included
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
    const prompt = `Generate competitor analysis insights for a ${business.category} business called "${business.name}" in ${business.location}.

Provide actionable advice on:
1. How to outrank competitors in local search
2. Key differentiators to highlight
3. Common competitor weaknesses to exploit
4. Local SEO tactics specific to this business type

Be specific and actionable. Return as a concise bullet-point list.`;

    const result = await this.generateWithAI(prompt, 400);
    return result.trim();
  }

  private analyzeFramework(framework: FrameworkInfo, quality?: ScrapingQuality): string {
    const insights: string[] = [];

    const frameworkAdvice: Record<string, { general: string[], ssr: string[], csr: string[] }> = {
      'Next.js': {
        general: [
          'Use next/head for dynamic meta tags per page',
          'Implement Next.js Image for automatic optimization',
          'Consider Incremental Static Regeneration (ISR) for SEO'
        ],
        ssr: ['Ensure proper getServerSideProps for real-time content'],
        csr: ['Consider Static Generation or ISR for better SEO performance']
      },
      'React': {
        general: [
          'Use react-helmet or @unhead/react for meta management',
          'Implement server-side rendering with Next.js or Remix',
          'Use React.lazy for code splitting'
        ],
        ssr: ['Meta tags properly rendered on server'],
        csr: ['Consider adding SSR (Next.js/Remix) for better SEO']
      },
      'Vue': {
        general: [
          'Use @unhead/vue for SEO meta tags',
          'Consider Nuxt.js for universal rendering',
          'Ensure proper hydration markers'
        ],
        ssr: ['SSR properly configured'],
        csr: ['Consider Nuxt.js for built-in SSR support']
      },
      'Angular': {
        general: [
          'Use Angular Universal for SSR',
          'Implement TransferState for API caching',
          'Configure Meta and Title services'
        ],
        ssr: ['Angular Universal is configured'],
        csr: ['Add @nguniversal/express-engine for SSR']
      },
      'Shopify (Theme)': {
        general: [
          'Use Shopify SEO features in admin panel',
          'Optimize product images with descriptive filenames',
          'Set up custom title templates in preferences'
        ],
        ssr: [],
        csr: []
      },
      'WordPress': {
        general: [
          'Install Yoast SEO or RankMath plugin',
          'Use a lightweight, SEO-friendly theme',
          'Optimize images with ShortPixel or Smush'
        ],
        ssr: [],
        csr: []
      },
      'Wix': {
        general: [
          'Use Wix SEO Hub for optimization',
          'Enable SEO-friendly URLs in settings',
          'Add alt text to images via media manager'
        ],
        ssr: [],
        csr: []
      },
      'Squarespace': {
        general: [
          'Use built-in SEO panel per page',
          'Enable SSL certificate',
          'Configure sitemap in Settings'
        ],
        ssr: [],
        csr: []
      }
    };

    const advice = frameworkAdvice[framework.name];
    if (advice) {
      insights.push(...advice.general);
      if (framework.renderingMode === 'csr' && advice.csr.length) {
        insights.push(...advice.csr);
      } else if (framework.renderingMode === 'ssr' && advice.ssr.length) {
        insights.push(...advice.ssr);
      }
    }

    if (quality && !quality.isComplete) {
      insights.push(`⚠️ Content may be incomplete due to ${framework.name}. ${quality.suggestedAction}`);
    }

    return insights.map(i => `- ${i}`).join('\n');
  }

  private buildSEOContext(business: BusinessInfo, scrapedData: ScrapedDataForAI | null): string {
    if (!scrapedData) {
      return `# Website Audit for ${business.name}
## Business Information
- Name: ${business.name}
- Category: ${business.category}
- Location: ${business.location}
- Website: ${business.website || 'Not provided'}

## Audit Status
No website data available. Please ensure the URL is correct and publicly accessible.`;
    }

    return `# Website Audit for ${business.name}
## Business Information
- Name: ${business.name}
- Category: ${business.category}
- Location: ${business.location}
- Website: ${business.website}

## On-Page SEO Metrics
- Title: "${scrapedData.title}" (${scrapedData.title.length} chars ${scrapedData.title.length <= 60 ? '✅' : '❌'})
- Meta Description: "${scrapedData.metaDescription}" (${scrapedData.metaDescription.length} chars ${scrapedData.metaDescription.length <= 160 ? '✅' : '❌'})
- H1 Tags: ${scrapedData.h1Tags.length} found ${scrapedData.h1Tags.length === 1 ? '✅' : '⚠️'}
- H2 Tags: ${scrapedData.h2Tags.length} found
- Word Count: ${scrapedData.wordCount} words ${scrapedData.wordCount >= 300 ? '✅' : '❌'}

## Content Analysis
- Images: ${scrapedData.images.length} total
${scrapedData.images.length > 0 ? `- Images with alt text: ${scrapedData.images.filter(i => i.alt).length}/${scrapedData.images.length}` : ''}
- Internal Links: ${scrapedData.internalLinks}
- External Links: ${scrapedData.externalLinks}
- Schema.org/JSON-LD: ${scrapedData.hasSchema ? '✅ Present' : '❌ Missing'}

## Social Meta (Open Graph)
- OG Title: ${scrapedData.ogTags.ogTitle ? '✅ ' + scrapedData.ogTags.ogTitle : '❌ Missing'}
- OG Description: ${scrapedData.ogTags.ogDescription ? '✅ Present' : '❌ Missing'}
- OG Image: ${scrapedData.ogTags.ogImage ? '✅ Present' : '❌ Missing'}

## Keywords
${scrapedData.keywords.length > 0 ? scrapedData.keywords.join(', ') : 'None detected'}`;
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
      // Remove the prompt from the response
      const response = generated.slice(prompt.length).trim();
      return response || this.getFallbackResponse(prompt);
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('recommendations')) {
      return `## SEO Recommendations

- Add a descriptive title tag (50-60 characters)
- Write a compelling meta description (150-160 characters)
- Ensure you have exactly one H1 heading with target keyword
- Add structured data (JSON-LD schema) for local business
- Add alt text to all images
- Expand content to 500+ words
- Add Open Graph tags for social sharing

## Technical Checklist

- [ ] XML sitemap submitted to Google Search Console
- [ ] Robots.txt allows crawling
- [ ] Page speed under 3 seconds
- [ ] Mobile responsive design
- [ ] HTTPS enabled`;
    }
    return 'AI generation unavailable. Please try again.';
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const aiService = new AIService();
export default aiService;
