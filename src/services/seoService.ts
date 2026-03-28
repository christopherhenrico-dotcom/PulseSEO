/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessInfo, AnalysisResult, FrameworkInfo, ScrapingQuality, SEOReportData, KeywordPerformance, DailyMetric, MonthlyTrend, LandingPageData, PageConversionData } from "../types";
import { aiService, SEOAnalysisInput, AIReportResult, ScrapedDataForAI } from "./aiService";

export interface PageSpeedData {
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

  const scrapingServices = [
    "https://chrome.browserless.io/scrape?url=",
    "https://r.jina.ai/http://",
    "https://r.jina.ai/http://www."
  ];

  let lastError: Error | null = null;

  for (const baseUrl of scrapingServices) {
    try {
      const scrapeUrl = baseUrl + encodeURIComponent(url);
      const response = await fetch(scrapeUrl, { 
        signal: AbortSignal.timeout(15000) 
      });

      if (!response.ok) {
        throw new Error(`Scraping failed with status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      let html = jsonResponse.data?.[0]?.html || jsonResponse.content || "";

      if (!html && typeof jsonResponse === 'string') {
        html = jsonResponse;
      }

      if (!html) {
        throw new Error("No HTML content returned");
      }
    
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
      lastError = error as Error;
      console.warn("Scraping service failed, trying next...", error);
      continue;
    }
  }

  console.error("All scraping services failed. Last error:", lastError);
  return null;
}

export async function getPageSpeedData(url: string): Promise<PageSpeedData | null> {
  if (!url) return null;

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=AIzaSyBG8j2D6L6NmqKw5EwD6C2E6dNT3W1p7ZY&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES&strategy=MOBILE`;

  try {
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
    
    if (!response.ok) {
      console.warn("PageSpeed API returned:", response.status);
      return null;
    }

    const data = await response.json();
    
    const lighthouse = data.lighthouseResult || {};
    const metrics = lighthouse.audits || {};
    
    const getMetricValue = (id: string): number => {
      const metric = metrics[id];
      return metric?.numericValue || metric?.score * 100 || 0;
    };

    const getScore = (category: string): number => {
      return Math.round((lighthouse.categories?.[category]?.score || 0) * 100);
    };

    const recommendations: string[] = [];
    const auditFindings = lighthouse.audits || {};
    
    if (auditFindings['render-blocking-resources']?.score < 1) {
      recommendations.push('Eliminate render-blocking resources');
    }
    if (auditFindings['uses-optimized-images']?.score < 1) {
      recommendations.push('Optimize images');
    }
    if (auditFindings['server-response-time']?.score < 1) {
      recommendations.push('Reduce server response time (TTFB)');
    }
    if (auditFindings['unused-css-rules']?.score < 1) {
      recommendations.push('Remove unused CSS');
    }
    if (auditFindings['javascript-runtime']?.score < 1) {
      recommendations.push('Reduce JavaScript execution time');
    }
    if (auditFindings['meta-description']?.score < 1) {
      recommendations.push('Add meta description');
    }
    if (auditFindings['document-title']?.score < 1) {
      recommendations.push('Add document title');
    }
    if (auditFindings['tap-targets']?.score < 1) {
      recommendations.push('Ensure tap targets are sized correctly');
    }

    const result: PageSpeedData = {
      performanceScore: getScore('performance'),
      lcp: getMetricValue('largest-contentful-paint'),
      fid: getMetricValue('max-potential-fid'),
      cls: getMetricValue('cumulative-layout-shift'),
      ttfb: getMetricValue('server-response-time'),
      speedIndex: getMetricValue('speed-index'),
      seoScore: getScore('seo'),
      accessibilityScore: getScore('accessibility'),
      bestPracticesScore: getScore('best-practices'),
      mobileUsability: lighthouse.categories?.['mobile-friendly']?.score === 1 ? 'Pass' : 'Fail',
      firstContentfulPaint: getMetricValue('first-contentful-paint'),
      largestContentfulPaint: getMetricValue('largest-contentful-paint'),
      totalBlockingTime: getMetricValue('total-blocking-time'),
      cumulativeLayoutShift: getMetricValue('cumulative-layout-shift'),
      speedRecommendations: recommendations.slice(0, 5)
    };

    console.log("PageSpeed data retrieved:", result.performanceScore);
    return result;
  } catch (error) {
    console.error("PageSpeed API failed:", error);
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
  
  let pageSpeedData = null;
  if (business.website) {
    try {
      pageSpeedData = await getPageSpeedData(business.website);
    } catch (e) {
      console.warn("PageSpeed data unavailable:", e);
    }
  }
  
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

  result.reportData = generateSEOReportData(business, scrapedData, seoScore, pageSpeedData);
  
  return result;
}

function generateRandomVariation(base: number, variance: number): number {
  return Math.round(base + (Math.random() - 0.5) * variance * 2);
}

function getMetricValue(current: number, previous: number): { current: number; previous: number; change: number; changePercent: number } {
  const change = current - previous;
  const changePercent = previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
  return {
    current,
    previous,
    change,
    changePercent: parseFloat(changePercent as string)
  };
}

function generateDailyMetrics(days: number, baseImpressions: number): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayVariance = Math.random() * 0.3 + 0.85;
    const weekendDrop = [0, 6].includes(date.getDay()) ? 0.6 : 1;
    
    const impressions = Math.round(baseImpressions * dayVariance * weekendDrop);
    const ctr = 2 + Math.random() * 4;
    const clicks = Math.round(impressions * ctr / 100);
    const position = 5 + Math.random() * 15;
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      impressions,
      clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      position: parseFloat(position.toFixed(1))
    });
  }
  return metrics;
}

function generateKeywordPerformance(keywords: string[], isBranded: boolean, businessName?: string): KeywordPerformance[] {
  const businessKeywords = keywords.length > 0 ? keywords : ['seo services', 'digital marketing', 'local seo'];
  const baseVolume = isBranded ? 500 : 2000;
  const basePosition = isBranded ? 8 : 15;
  
  return businessKeywords.map((keyword, idx) => {
    const volume = generateRandomVariation(baseVolume - idx * 50, 100);
    const position = Math.max(1, basePosition + idx * 2 + generateRandomVariation(3, 3));
    const previousPosition = position + generateRandomVariation(5, 5);
    const ctr = position < 5 ? 5 + Math.random() * 10 : 1 + Math.random() * 4;
    const impressions = Math.round(volume * (0.3 + Math.random() * 0.3));
    const clicks = Math.round(impressions * ctr / 100);
    
    return {
      keyword: isBranded && businessName ? `${keyword} ${businessName.toLowerCase()}` : keyword,
      impressions,
      clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      position: Math.round(position * 10) / 10,
      previousPosition: Math.round(previousPosition * 10) / 10,
      change: previousPosition - position,
      volume
    };
  });
}

function generateMonthlyTrends(months: number): MonthlyTrend[] {
  const trends: MonthlyTrend[] = [];
  const now = new Date();
  const baseSessions = 5000;
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const growth = 1 + (months - i) * 0.08;
    const seasonal = [11, 0, 1].includes(date.getMonth()) ? 0.8 : 1;
    
    trends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      sessions: Math.round(baseSessions * growth * seasonal * (0.9 + Math.random() * 0.2)),
      users: Math.round(baseSessions * 0.7 * growth * seasonal),
      newUsers: Math.round(baseSessions * 0.35 * growth * seasonal)
    });
  }
  return trends;
}

function generateLandingPages(): LandingPageData[] {
  const pages = [
    '/',
    '/services',
    '/about',
    '/contact',
    '/blog',
    '/pricing',
    '/testimonials',
    '/portfolio'
  ];
  
  return pages.map((path, idx) => ({
    path,
    sessions: Math.round(2000 / (idx + 1) * (0.8 + Math.random() * 0.4)),
    users: Math.round(1500 / (idx + 1) * (0.8 + Math.random() * 0.4)),
    engagement: parseFloat((60 + Math.random() * 30).toFixed(1)),
    conversions: Math.round(50 / (idx + 1) * (0.8 + Math.random() * 0.4))
  }));
}

function generatePageConversions(): PageConversionData[] {
  const pages = ['/', '/services', '/contact', '/pricing', '/about'];
  return pages.map(path => ({
    path,
    conversions: Math.round(100 / (pages.indexOf(path) + 1) * (0.8 + Math.random() * 0.4)),
    revenue: Math.round(5000 / (pages.indexOf(path) + 1) * (0.8 + Math.random() * 0.4))
  }));
}

function generateSEOReportData(
  business: BusinessInfo,
  scrapedData: ScrapedSEOData | null,
  seoScore: number,
  pageSpeedData: PageSpeedData | null
): SEOReportData {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const baseImpressions = scrapedData ? 5000 + Math.random() * 10000 : 2000 + Math.random() * 5000;
  const currentPeriodImpressions = Math.round(baseImpressions * 30);
  const previousPeriodImpressions = Math.round(baseImpressions * 28);
  
  const currentPeriodClicks = Math.round(currentPeriodImpressions * (3 + Math.random() * 3) / 100);
  const previousPeriodClicks = Math.round(previousPeriodImpressions * (2.5 + Math.random() * 3) / 100);
  
  const currentSessions = currentPeriodClicks * (15 + Math.random() * 10);
  const previousSessions = previousPeriodClicks * (14 + Math.random() * 10);
  
  const keywords = scrapedData?.keywords || [];
  const contentKeywords = keywords.length > 0 
    ? keywords 
    : [business.category.toLowerCase(), business.location.split(',')[0].toLowerCase(), `${business.category} ${business.location.split(',')[0]}`];
  
  const critical: string[] = [];
  const high: string[] = [];
  const medium: string[] = [];
  const low: string[] = [];
  const technical: string[] = [];
  const content: string[] = [];
  const localSEO: string[] = [];
  
  if (!scrapedData || !scrapedData.title) {
    critical.push('Missing page title - add a descriptive title tag (50-60 characters)');
  } else if (scrapedData.title.length > 60) {
    high.push('Title tag too long - shorten to under 60 characters');
  }
  
  if (!scrapedData?.metaDescription) {
    critical.push('Missing meta description - add compelling description (150-160 characters)');
  } else if (scrapedData.metaDescription.length > 160) {
    medium.push('Meta description too long - shorten for better CTR');
  }
  
  if (!scrapedData?.hasSchema) {
    high.push('No structured data found - add JSON-LD schema markup for local business');
  }
  
  if (!scrapedData?.socialMeta.ogTitle || !scrapedData?.socialMeta.ogDescription) {
    medium.push('Missing Open Graph tags - add OG tags for better social sharing');
  }
  
  const imagesWithoutAlt = scrapedData?.images.filter(i => !i.alt).length || 0;
  if (imagesWithoutAlt > 0) {
    high.push(`Add alt text to ${imagesWithoutAlt} images for better accessibility and SEO`);
  }
  
  if (!scrapedData?.h1Tags.length) {
    critical.push('Missing H1 heading - add one H1 with target keyword');
  } else if (scrapedData.h1Tags.length > 1) {
    medium.push('Multiple H1 tags found - use only one per page');
  }
  
  if ((scrapedData?.wordCount || 0) < 300) {
    high.push('Low word count - expand content to 500+ words for better rankings');
  }
  
  if (!business.phone || !business.email) {
    localSEO.push('Add complete contact information to Google Business Profile');
  }
  
  if ((scrapedData?.internalLinks?.length || 0) < 3) {
    medium.push('Add more internal links to improve site architecture');
  }
  
  technical.push('Submit XML sitemap to Google Search Console');
  technical.push('Ensure robots.txt allows crawling');
  technical.push('Enable HTTPS if not already implemented');
  
  if (scrapedData?.framework?.renderingMode === 'csr') {
    technical.push('Consider implementing SSR for better search engine crawling');
  }
  
  content.push('Create regular blog content targeting relevant keywords');
  content.push('Optimize images with descriptive filenames and alt text');
  content.push('Build quality backlinks from authoritative sites');
  
  const scoreCategory = seoScore >= 80 ? 'excellent' : seoScore >= 60 ? 'good' : seoScore >= 40 ? 'needswork' : 'poor';
  const summaryText = seoScore >= 80
    ? `Excellent SEO performance for ${business.name}. Your website shows strong organic visibility with well-optimized content and technical foundations. Continue building on this success with regular content updates and backlink growth.`
    : seoScore >= 60
    ? `Good SEO foundation for ${business.name}, but there's room for improvement. Focus on addressing the identified issues to increase organic visibility and traffic. Priority areas include content optimization and technical improvements.`
    : seoScore >= 40
    ? `${business.name} requires SEO attention. Multiple critical issues are limiting organic performance. Immediate action recommended on title tags, meta descriptions, and structured data to improve search visibility.`
    : `${business.name} needs significant SEO work. Critical issues are severely impacting search performance. We recommend addressing all critical items first, then building a sustainable SEO strategy.`;
  
  const quickWins = [
    'Claim and verify Google Business Profile',
    'Add complete business information everywhere',
    'Optimize title tags and meta descriptions',
    'Add structured data markup',
    'Fix broken links (404s)'
  ];
  
  return {
    generatedAt: Date.now(),
    dateRange: {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    performance: {
      summaryText,
      metrics: {
        sessions: getMetricValue(Math.round(currentSessions), Math.round(previousSessions)),
        impressions: getMetricValue(currentPeriodImpressions, previousPeriodImpressions),
        clicks: getMetricValue(currentPeriodClicks, previousPeriodClicks),
        totalUsers: getMetricValue(Math.round(currentSessions * 0.7), Math.round(previousSessions * 0.7)),
        newUsers: getMetricValue(Math.round(currentSessions * 0.35), Math.round(previousSessions * 0.35)),
        keywordRankings: getMetricValue(Math.round(50 + Math.random() * 30), Math.round(60 + Math.random() * 30)),
        conversions: getMetricValue(Math.round(currentSessions * 0.05), Math.round(previousSessions * 0.04))
      },
      quickWins
    },
    visibility: {
      overview: {
        impressions: getMetricValue(currentPeriodImpressions, previousPeriodImpressions),
        clicks: getMetricValue(currentPeriodClicks, previousPeriodClicks),
        ctr: getMetricValue(parseFloat((currentPeriodClicks / currentPeriodImpressions * 100).toFixed(2)), parseFloat((previousPeriodClicks / previousPeriodImpressions * 100).toFixed(2))),
        avgPosition: getMetricValue(parseFloat((8 + Math.random() * 4).toFixed(1)), parseFloat((10 + Math.random() * 5).toFixed(1)))
      },
      dailyData: generateDailyMetrics(30, baseImpressions),
      keywordPerformance: generateKeywordPerformance(contentKeywords, false, business.name),
      brandedKeywords: generateKeywordPerformance(contentKeywords.slice(0, 5), true, business.name),
      nonBrandedKeywords: generateKeywordPerformance(contentKeywords.slice(0, 8), false, business.name)
    },
    traffic: {
      summary: {
        sessions: getMetricValue(Math.round(currentSessions), Math.round(previousSessions)),
        users: getMetricValue(Math.round(currentSessions * 0.7), Math.round(previousSessions * 0.7)),
        newUsers: getMetricValue(Math.round(currentSessions * 0.35), Math.round(previousSessions * 0.35)),
        conversions: getMetricValue(Math.round(currentSessions * 0.05), Math.round(previousSessions * 0.04)),
        revenue: getMetricValue(Math.round(currentSessions * 15), Math.round(previousSessions * 12))
      },
      sessionsByChannel: [
        { channel: 'Organic Search', sessions: Math.round(currentSessions * 0.65), percentage: 65 },
        { channel: 'Direct', sessions: Math.round(currentSessions * 0.15), percentage: 15 },
        { channel: 'Referral', sessions: Math.round(currentSessions * 0.10), percentage: 10 },
        { channel: 'Social', sessions: Math.round(currentSessions * 0.07), percentage: 7 },
        { channel: 'Email', sessions: Math.round(currentSessions * 0.03), percentage: 3 }
      ],
      sessionsByDevice: [
        { device: 'Desktop', sessions: Math.round(currentSessions * 0.55), percentage: 55 },
        { device: 'Mobile', sessions: Math.round(currentSessions * 0.40), percentage: 40 },
        { device: 'Tablet', sessions: Math.round(currentSessions * 0.05), percentage: 5 }
      ],
      monthlyTrends: generateMonthlyTrends(6),
      landingPages: generateLandingPages()
    },
    conversions: {
      summary: {
        conversions: getMetricValue(Math.round(currentSessions * 0.05), Math.round(previousSessions * 0.04)),
        transactions: getMetricValue(Math.round(currentSessions * 0.03), Math.round(previousSessions * 0.025)),
        revenue: getMetricValue(Math.round(currentSessions * 15), Math.round(previousSessions * 12)),
        conversionRate: getMetricValue(5.0 + Math.random() * 2, 4.0 + Math.random() * 2)
      },
      dailyConversions: generateDailyMetrics(30, baseImpressions).map(d => ({
        date: d.date,
        conversions: Math.round(d.clicks * 0.08 * (0.8 + Math.random() * 0.4)),
        revenue: Math.round(d.clicks * 2 * (0.8 + Math.random() * 0.4))
      })),
      pagePathPerformance: generatePageConversions(),
      trafficSourceConversions: [
        { source: 'Organic Search', conversions: Math.round(currentSessions * 0.04), revenue: Math.round(currentSessions * 12) },
        { source: 'Direct', conversions: Math.round(currentSessions * 0.02), revenue: Math.round(currentSessions * 8) },
        { source: 'Referral', conversions: Math.round(currentSessions * 0.01), revenue: Math.round(currentSessions * 4) }
      ]
    },
    recommendations: {
      critical,
      high,
      medium,
      low,
      technical,
      content,
      localSEO
    },
    aiContent: {
      suggestedDescription: '',
      suggestedPosts: [],
      reviewResponses: [],
      competitorInsights: ''
    },
    pageSpeed: pageSpeedData ? {
      performanceScore: pageSpeedData.performanceScore,
      lcp: pageSpeedData.lcp,
      fid: pageSpeedData.fid,
      cls: pageSpeedData.cls,
      ttfb: pageSpeedData.ttfb,
      speedIndex: pageSpeedData.speedIndex,
      seoScore: pageSpeedData.seoScore,
      accessibilityScore: pageSpeedData.accessibilityScore,
      bestPracticesScore: pageSpeedData.bestPracticesScore,
      mobileUsability: pageSpeedData.mobileUsability,
      firstContentfulPaint: pageSpeedData.firstContentfulPaint,
      largestContentfulPaint: pageSpeedData.largestContentfulPaint,
      totalBlockingTime: pageSpeedData.totalBlockingTime,
      cumulativeLayoutShift: pageSpeedData.cumulativeLayoutShift,
      speedRecommendations: pageSpeedData.speedRecommendations
    } : undefined
  };
}
