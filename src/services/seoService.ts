/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessInfo, AnalysisResult, FrameworkInfo, ScrapingQuality } from "../types";
import { aiService, SEOAnalysisInput, AIReportResult, ScrapedDataForAI } from "./aiService";

interface FrameworkDetector {
  name: string;
  patterns: RegExp[];
  scriptPatterns: string[];
  metaIndicators: { attr: string; value: RegExp }[];
}

const FRAMEWORK_DETECTORS: FrameworkDetector[] = [
  {
    name: 'Next.js',
    patterns: [/_next\/static\//, /__NEXT_DATA__/, /next\/router/, /\.next\//],
    scriptPatterns: ['next.js', 'nextjs', '_next'],
    metaIndicators: [{ attr: 'data-nimg', value: /./ }]
  },
  {
    name: 'React',
    patterns: [/<div id="root"/, /<div id="__next"/, /react-dom/, /data-reactroot/i],
    scriptPatterns: ['react.production.min.js', 'react.development.js', 'react-jsx'],
    metaIndicators: []
  },
  {
    name: 'Vue',
    patterns: [/__vue_app__/, /__vue_options__/, /vue\.runtime\.js/],
    scriptPatterns: ['vue.runtime.esm-browser.js', 'vue.global.prod.js', 'vue.js'],
    metaIndicators: [{ attr: 'data-v-', value: /./ }]
  },
  {
    name: 'Angular',
    patterns: [/ng-version/, /ng-app/, /<app-root/, /angular\.js/],
    scriptPatterns: ['angular.js', 'angular.min.js', '@angular/core'],
    metaIndicators: []
  },
  {
    name: 'Nuxt.js',
    patterns: [/_nuxt\//, /__NUXT__/, /nuxt\.js/],
    scriptPatterns: ['nuxt', 'nuxt.config'],
    metaIndicators: []
  },
  {
    name: 'Gatsby',
    patterns: [/\.gatsby\./, /gatsby-/],
    scriptPatterns: ['gatsby-browser', 'gatsby-ssr.js'],
    metaIndicators: []
  },
  {
    name: 'SvelteKit',
    patterns: [/\?__data\.json/, /svelte-kit\.js/],
    scriptPatterns: ['svelte', '.svelte'],
    metaIndicators: []
  },
  {
    name: 'Remix',
    patterns: [/_remix\/routes/, /remix\.js/],
    scriptPatterns: ['@remix-run'],
    metaIndicators: []
  },
  {
    name: 'Shopify (Theme)',
    patterns: [/cdn\.shopify\.com/, /shopify/, /myshopify\.com/],
    scriptPatterns: ['shopify-checkout', 'shopify-api'],
    metaIndicators: []
  },
  {
    name: 'WordPress',
    patterns: [/wp-content\//, /wp-includes\//, /wp-json\//],
    scriptPatterns: ['jquery-migrate', 'wp-emoji-release'],
    metaIndicators: []
  },
  {
    name: 'Wix',
    patterns: [/wix\.com/, /data-wix-style/, /wix-artifacts/],
    scriptPatterns: ['wix', 'parsite-definitions'],
    metaIndicators: []
  },
  {
    name: 'Squarespace',
    patterns: [/\.squarespace\.com/, /squarespace\//],
    scriptPatterns: ['squarespace'],
    metaIndicators: []
  },
  {
    name: 'Webflow',
    patterns: [/webflow\.io/, /webflow\.com/],
    scriptPatterns: ['webflow'],
    metaIndicators: []
  }
];

interface DetectedFramework {
  name: string;
  confidence: number;
  indicators: string[];
}

function detectFramework(doc: Document, html: string): DetectedFramework | null {
  const detectedFrameworks: DetectedFramework[] = [];
  const allScripts = Array.from(doc.querySelectorAll('script[src]')).map(s => s.getAttribute('src') || '');
  const inlineScripts = html;
  
  for (const detector of FRAMEWORK_DETECTORS) {
    const foundIndicators: string[] = [];
    
    for (const pattern of detector.patterns) {
      if (pattern.test(html) || pattern.test(allScripts.join(' '))) {
        foundIndicators.push(`html:${pattern.source}`);
      }
    }
    
    for (const src of allScripts) {
      for (const scriptPattern of detector.scriptPatterns) {
        if (src.toLowerCase().includes(scriptPattern.toLowerCase())) {
          foundIndicators.push(`script:${scriptPattern}`);
        }
      }
    }
    
    for (const meta of detector.metaIndicators) {
      const elements = doc.querySelectorAll(`[${meta.attr}]`);
      if (elements.length > 0) {
        foundIndicators.push(`attr:${meta.attr}`);
      }
    }
    
    if (foundIndicators.length > 0) {
      const confidence = Math.min(foundIndicators.length * 25, 100);
      detectedFrameworks.push({
        name: detector.name,
        confidence,
        indicators: foundIndicators
      });
    }
  }
  
  if (detectedFrameworks.length === 0) return null;
  
  return detectedFrameworks.sort((a, b) => b.confidence - a.confidence)[0];
}

function detectRenderingMode(doc: Document, html: string, framework: DetectedFramework | null): 'ssr' | 'ssg' | 'csr' | 'unknown' {
  const ssrIndicators = [
    /<title>/i,
    /<meta[^>]+description/i,
    /<h1/i,
    /<article/i,
    /<main/i
  ];
  
  const csrIndicators = [
    /<div id="root"/,
    /<div id="app"/,
    /<div id="mount"/,
    /__NUXT__/,
    /__NEXT_DATA__/,
    /ng-version/
  ];
  
  const ssgIndicators = [
    /gatsby-/,
    /_next\/static\//,
    /\.next\//
  ];
  
  const hasSSG = ssgIndicators.some(p => p.test(html));
  if (hasSSG || (framework && ['Next.js', 'Gatsby', 'Nuxt.js'].includes(framework.name))) {
    return 'ssg';
  }
  
  const hasSSR = ssrIndicators.filter(p => p.test(html)).length >= 3;
  const hasCSR = csrIndicators.some(p => p.test(html));
  
  if (hasSSR && !hasCSR) return 'ssr';
  if (hasCSR) return 'csr';
  
  return 'unknown';
}

function assessScrapingQuality(
  doc: Document,
  framework: DetectedFramework | null,
  renderingMode: 'ssr' | 'ssg' | 'csr' | 'unknown',
  wordCount: number
): ScrapingQuality {
  const limitations: string[] = [];
  let isComplete = true;
  let suggestedAction = 'Data is reliable for SEO analysis.';

  if (renderingMode === 'csr' || (framework && ['React', 'Vue', 'Angular'].includes(framework.name))) {
    isComplete = false;
    limitations.push('Site uses client-side rendering (CSR). Content may not be fully captured.');
    suggestedAction = 'Consider using a headless browser or server-side rendering service for complete data.';
  }

  if (framework && ['Next.js', 'Gatsby', 'Nuxt.js'].includes(framework.name) && renderingMode !== 'ssr') {
    limitations.push(`${framework.name} site with dynamic content loading.`);
    suggestedAction = 'Some content may require JavaScript execution to render. Current data represents pre-hydration state.';
  }

  if (wordCount < 50) {
    isComplete = false;
    limitations.push('Very low word count detected - likely missing content due to JS rendering.');
    suggestedAction = 'Website appears to load content via JavaScript. Traditional scraping captured minimal data.';
  }

  if (limitations.length === 0) {
    return { isComplete: true, limitations: [], suggestedAction: 'Data is reliable for SEO analysis.' };
  }

  return { isComplete, limitations, suggestedAction };
}

export interface ScrapedSEOData {
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  keywords: string[];
  images: { src: string; alt: string }[];
  internalLinks: string[];
  externalLinks: string[];
  wordCount: number;
  hasSchema: boolean;
  socialMeta: { ogTitle?: string; ogDescription?: string; ogImage?: string };
  framework?: FrameworkInfo;
  scrapingQuality?: ScrapingQuality;
}

export async function scrapeWebsite(url: string): Promise<ScrapedSEOData | null> {
  if (!url) return null;
  
  const corsProxy = "https://api.allorigins.win/raw?url=";
  
  try {
    const response = await fetch(corsProxy + encodeURIComponent(url), {
      headers: { "Accept": "text/html" }
    });
    
    if (!response.ok) throw new Error("Failed to fetch");
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    const title = doc.querySelector("title")?.textContent?.trim() || "";
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    
    const h1Tags = Array.from(doc.querySelectorAll("h1")).map(el => el.textContent?.trim()).filter(Boolean);
    const h2Tags = Array.from(doc.querySelectorAll("h2")).map(el => el.textContent?.trim()).filter(Boolean);
    
    const keywordsMeta = doc.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
    const keywords = keywordsMeta ? keywordsMeta.split(",").map(k => k.trim()).filter(Boolean) : [];
    
    const images = Array.from(doc.querySelectorAll("img")).map(img => ({
      src: img.getAttribute("src") || "",
      alt: img.getAttribute("alt") || ""
    })).filter(img => img.src);
    
    const links = Array.from(doc.querySelectorAll("a[href]")).map(a => a.getAttribute("href") || "");
    const internalLinks = links.filter(l => l.startsWith("/") || l.includes(url));
    const externalLinks = links.filter(l => !l.startsWith("/") && !l.includes(url));
    
    const bodyText = doc.body?.textContent || "";
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
    
    const hasSchema = !!doc.querySelector('script[type="application/ld+json"]');
    
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");
    
    const detectedFramework = detectFramework(doc, html);
    const renderingMode = detectRenderingMode(doc, html, detectedFramework);
    const scrapingQuality = assessScrapingQuality(doc, detectedFramework, renderingMode, wordCount);
    
    const frameworkInfo: FrameworkInfo | undefined = detectedFramework ? {
      name: detectedFramework.name,
      confidence: detectedFramework.confidence,
      renderingMode,
      detectedIndicators: detectedFramework.indicators
    } : undefined;
    
    return {
      title,
      metaDescription,
      h1Tags,
      h2Tags,
      keywords,
      images,
      internalLinks,
      externalLinks,
      wordCount,
      hasSchema,
      socialMeta: { ogTitle, ogDescription, ogImage },
      framework: frameworkInfo,
      scrapingQuality
    };
  } catch (error) {
    console.error("Scraping failed:", error);
    return null;
  }
}

function calculateRuleBasedScore(data: ScrapedSEOData): number {
  let score = 50;
  
  if (data.title && data.title.length > 0 && data.title.length <= 60) score += 10;
  if (data.metaDescription && data.metaDescription.length > 0 && data.metaDescription.length <= 160) score += 10;
  if (data.h1Tags.length > 0) score += 10;
  if (data.h1Tags.length >= 1 && data.h1Tags.length <= 3) score += 5;
  if (data.h2Tags.length > 0) score += 5;
  if (data.keywords.length > 0) score += 5;
  if (data.hasSchema) score += 10;
  if (data.images.length > 0) {
    const imagesWithAlt = data.images.filter(i => i.alt && i.alt.length > 0).length;
    const altRatio = imagesWithAlt / data.images.length;
    score += Math.round(altRatio * 5);
  }
  if (data.wordCount > 300) score += 5;
  if (data.internalLinks.length > 3) score += 5;
  if (data.socialMeta.ogTitle) score += 3;
  if (data.socialMeta.ogDescription) score += 2;
  
  const baseScore = Math.min(100, score);
  
  if (data.scrapingQuality && !data.scrapingQuality.isComplete) {
    const penalty = Math.min(15, data.scrapingQuality.limitations.length * 5);
    return Math.max(5, baseScore - penalty);
  }
  
  if (data.framework && data.framework.renderingMode === 'csr') {
    return Math.max(5, baseScore - 5);
  }
  
  return baseScore;
}

function getFrameworkRecommendations(framework: FrameworkInfo): string[] {
  const recs: string[] = [];
  
  const frameworkSpecificRecs: Record<string, { general: string[], ssr: string[], csr: string[] }> = {
    'Next.js': {
      general: [
        'Configure next/head for dynamic meta tags per page',
        'Use Next.js Image component for automatic optimization',
        'Implement incremental static regeneration (ISR) for SEO'
      ],
      ssr: ['Ensure proper getServerSideProps for real-time content'],
      csr: ['Consider moving to Static Generation or ISR for better SEO']
    },
    'React': {
      general: [
        'Use react-helmet or next/head for meta tag management',
        'Implement server-side rendering with Next.js or Remix',
        'Use React.lazy for code splitting without hurting SEO'
      ],
      ssr: ['Meta tags are properly rendered on server'],
      csr: ['Consider adding SSR (Next.js/Remix) or pre-rendering for SEO']
    },
    'Vue': {
      general: [
        'Use Vue Meta or @unhead/vue for SEO meta tags',
        'Implement Nuxt.js for universal rendering',
        'Ensure proper hydration markers'
      ],
      ssr: ['SSR is properly configured'],
      csr: ['Consider Nuxt.js for SSR support']
    },
    'Angular': {
      general: [
        'Use Angular Universal for SSR and SEO',
        'Implement TransferState for caching API calls',
        'Configure proper meta and title services'
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
        'Optimize images with Smush or similar'
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
        'Configure site map in Settings'
      ],
      ssr: [],
      csr: []
    }
  };
  
  const specificRecs = frameworkSpecificRecs[framework.name];
  if (specificRecs) {
    recs.push(...specificRecs.general);
    if (framework.renderingMode === 'csr') {
      recs.push(...specificRecs.csr);
    } else if (framework.renderingMode === 'ssr') {
      recs.push(...specificRecs.ssr);
    }
  }
  
  return recs;
}

function generateRuleBasedRecommendations(data: ScrapedSEOData): string {
  const recs: string[] = [];
  const limitations: string[] = [];
  
  if (!data.title || data.title.length === 0) {
    recs.push("- Add a descriptive title tag (50-60 characters)");
  } else if (data.title.length > 60) {
    recs.push(`- Shorten title tag (currently ${data.title.length} chars, aim for 50-60)`);
  }
  
  if (!data.metaDescription || data.metaDescription.length === 0) {
    recs.push("- Add a meta description (150-160 characters)");
  } else if (data.metaDescription.length > 160) {
    recs.push(`- Shorten meta description (currently ${data.metaDescription.length} chars)`);
  }
  
  if (data.h1Tags.length === 0) {
    recs.push("- Add at least one H1 heading with target keyword");
  } else if (data.h1Tags.length > 3) {
    recs.push(`- Reduce H1 tags (currently ${data.h1Tags.length}, use only 1-2)`);
  }
  
  if (data.h2Tags.length === 0) {
    recs.push("- Add H2 subheadings to structure content");
  }
  
  if (!data.hasSchema) {
    recs.push("- Add structured data (JSON-LD schema) for local business");
  }
  
  const imagesWithoutAlt = data.images.filter(i => !i.alt || i.alt.length === 0).length;
  if (imagesWithoutAlt > 0) {
    recs.push(`- Add alt text to ${imagesWithoutAlt} images`);
  }
  
  if (data.wordCount < 300) {
    recs.push(`- Expand content (only ${data.wordCount} words, aim for 500+)`);
  }
  
  if (!data.socialMeta.ogTitle) {
    recs.push("- Add Open Graph tags for social sharing");
  }
  
  if (data.framework) {
    const frameworkRecs = getFrameworkRecommendations(data.framework);
    if (frameworkRecs.length > 0) {
      limitations.push(...frameworkRecs);
    }
  }
  
  if (data.scrapingQuality && !data.scrapingQuality.isComplete) {
    limitations.push(`**Note:** This site's content may be incomplete due to ${data.framework?.name || 'JavaScript'}-based rendering. ${data.scrapingQuality.suggestedAction}`);
  }
  
  if (recs.length === 0 && limitations.length === 0) {
    recs.push("- Great job! Continue publishing quality content regularly");
  }
  
  let output = '## SEO Recommendations\n\n' + recs.join('\n') + '\n';
  
  if (data.framework) {
    output += `\n\n## Framework Analysis: ${data.framework.name}\n`;
    output += `- **Rendering Mode:** ${data.framework.renderingMode.toUpperCase()}\n`;
    output += `- **Detection Confidence:** ${data.framework.confidence}%\n`;
    if (data.framework.detectedIndicators.length > 0) {
      output += `- **Detected:** ${data.framework.detectedIndicators.slice(0, 5).join(', ')}${data.framework.detectedIndicators.length > 5 ? '...' : ''}\n`;
    }
  }
  
  if (limitations.length > 0) {
    output += `\n\n## Framework-Specific Recommendations\n\n${limitations.map(r => `- ${r}`).join('\n')}\n`;
  }
  
  if (data.scrapingQuality && !data.scrapingQuality.isComplete) {
    output += `\n\n## Scraping Limitations\n\n${data.scrapingQuality.limitations.map(l => `- ⚠️ ${l}`).join('\n')}\n`;
  }
  
  output += `\n\n## Technical Checklist\n\n- [ ] XML sitemap submitted to Google Search Console\n- [ ] Robots.txt allows crawling\n- [ ] Page speed under 3 seconds\n- [ ] Mobile responsive design\n- [ ] HTTPS enabled`;
  
  return output;
}

function extractKeywordsFromContent(data: ScrapedSEOData): string[] {
  const allText = [
    data.title,
    data.metaDescription,
    ...data.h1Tags,
    ...data.h2Tags
  ].join(' ').toLowerCase();
  
  const words = allText.replace(/[^\w\s]/g, '').split(/\s+/);
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set(['the', 'and', 'a', 'of', 'to', 'in', 'is', 'it', 'for', 'with', 'on', 'at', 'by', 'an', 'be', 'this', 'that', 'your', 'you', 'are', 'we', 'our', 'us']);
  
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

function convertToAIData(scrapedData: ScrapedSEOData): ScrapedDataForAI {
  return {
    title: scrapedData.title,
    metaDescription: scrapedData.metaDescription,
    h1Tags: scrapedData.h1Tags,
    h2Tags: scrapedData.h2Tags,
    keywords: scrapedData.keywords,
    images: scrapedData.images,
    internalLinks: scrapedData.internalLinks.length,
    externalLinks: scrapedData.externalLinks.length,
    wordCount: scrapedData.wordCount,
    hasSchema: scrapedData.hasSchema,
    ogTags: scrapedData.socialMeta
  };
}

export async function analyzeBusiness(business: BusinessInfo, useAI: boolean = true): Promise<AnalysisResult> {
  const scrapedData = business.website ? await scrapeWebsite(business.website) : null;
  
  if (!scrapedData) {
    return {
      seoScore: 30,
      gmbOptimized: false,
      recommendations: `## SEO Audit for ${business.name}\n\n### Missing Website Data\n\nUnable to scrape website. Please ensure:\n\n- Website URL is correct\n- Website is publicly accessible\n- No security blocks (Cloudflare, etc.)\n\n### General Recommendations\n\n- Add your website URL for detailed analysis\n- Optimize Google Business Profile\n- Build quality backlinks\n- Create regular content`,
      suggestedDescription: `${business.name} - Professional ${business.category} services in ${business.location}. Call today for expert assistance.`,
      suggestedPosts: [
        `🎉 Check out our new services at ${business.name}! We're proud to serve the ${business.location} community with quality ${business.category} solutions.`,
        `📍 Visit us at our ${business.location} location! At ${business.name}, we're committed to exceeding your expectations.`,
        `⭐ Thank you to all our valued customers in ${business.location}! Your trust drives us to deliver excellence every day.`
      ],
      reviewResponses: [
        { review: "Great service and friendly staff!", response: "Thank you so much for the kind words! We're thrilled to have served you and look forward to seeing you again soon." },
        { review: "Very professional, would recommend.", response: "We appreciate your recommendation! It was our pleasure to help. Don't hesitate to reach out if you need anything in the future." }
      ],
      keywords: [`${business.category} ${business.location}`, `${business.name} reviews`, `best ${business.category} ${business.location}`],
      competitorInsights: "Monitor competitor Google Business profiles, track their reviews, analyze their website keywords, and observe their posting frequency to stay competitive."
    };
  }
  
  const seoScore = calculateRuleBasedScore(scrapedData);
  
  let aiResult: AIReportResult | null = null;
  let recommendations = generateRuleBasedRecommendations(scrapedData);
  let keywords = extractKeywordsFromContent(scrapedData);
  
  if (useAI) {
    try {
      const aiInput: SEOAnalysisInput = {
        business,
        scrapedData: convertToAIData(scrapedData),
        frameworkInfo: scrapedData.framework,
        scrapingQuality: scrapedData.scrapingQuality
      };
      aiResult = await aiService.generateSEOReport(aiInput);
      recommendations = aiResult.recommendations;
      keywords = aiResult.keywords;
    } catch (error) {
      console.error('AI generation failed, using rule-based fallback:', error);
    }
  }
  
  const isGMBOptimized = 
    scrapedData.hasSchema && 
    scrapedData.socialMeta.ogTitle && 
    scrapedData.socialMeta.ogDescription &&
    scrapedData.images.length > 0;
  
  const result: AnalysisResult = {
    seoScore,
    gmbOptimized: isGMBOptimized,
    recommendations,
    suggestedDescription: aiResult?.suggestedDescription || `${business.name} provides professional ${business.category} services in ${business.location}. With years of experience, we deliver quality solutions tailored to your needs. Contact us today for exceptional service.`,
    suggestedPosts: aiResult?.suggestedPosts || [
      `🎉 Welcome to ${business.name}! Your trusted ${business.category} expert in ${business.location}. We're here to serve all your needs!`,
      `📍 Located in the heart of ${business.location}, ${business.name} is dedicated to providing top-notch ${business.category} services. Visit us today!`,
      `⭐ Thank you for choosing ${business.name}! Your satisfaction is our priority. Review us on Google to help others discover our ${business.category} services in ${business.location}.`
    ],
    reviewResponses: aiResult?.reviewResponses || [
      { review: "Amazing service! Highly recommend.", response: "Thank you for the stellar review! We're delighted you had a great experience with us. We look forward to serving you again!" },
      { review: "Professional and timely. Will use again.", response: "We appreciate your feedback! It's great to know we met your expectations. Don't hesitate to reach out anytime you need our services." }
    ],
    keywords,
    competitorInsights: aiResult?.competitorInsights || "To outrank competitors: ensure complete Google Business Profile, respond to all reviews, post weekly, use relevant categories, add photos regularly, and maintain consistent NAP information across directories."
  };
  
  if (scrapedData.framework) {
    result.frameworkInfo = scrapedData.framework;
  }
  
  if (scrapedData.scrapingQuality) {
    result.scrapingQuality = scrapedData.scrapingQuality;
  }
  
  return result;
}
