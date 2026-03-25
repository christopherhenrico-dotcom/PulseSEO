/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pipeline, env } from '@huggingface/transformers';
import { BusinessInfo, AnalysisResult } from "../types";

env.allowLocalModels = false;
env.useBrowserCache = true;

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
      socialMeta: { ogTitle, ogDescription, ogImage }
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
  
  return Math.min(100, score);
}

function generateRuleBasedRecommendations(data: ScrapedSEOData): string {
  const recs: string[] = [];
  
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
  
  if (recs.length === 0) {
    recs.push("- Great job! Continue publishing quality content regularly");
  }
  
  return `## SEO Recommendations\n\n${recs.join('\n')}\n\n## Technical Checklist\n\n- [ ] XML sitemap submitted to Google Search Console\n- [ ] Robots.txt allows crawling\n- [ ] Page speed under 3 seconds\n- [ ] Mobile responsive design\n- [ ] HTTPS enabled`;
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

export async function analyzeBusiness(business: BusinessInfo): Promise<AnalysisResult> {
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
  const recommendations = generateRuleBasedRecommendations(scrapedData);
  const keywords = extractKeywordsFromContent(scrapedData);
  
  const isGMBOptimized = 
    scrapedData.hasSchema && 
    scrapedData.socialMeta.ogTitle && 
    scrapedData.socialMeta.ogDescription &&
    scrapedData.images.length > 0;
  
  return {
    seoScore,
    gmbOptimized: isGMBOptimized,
    recommendations,
    suggestedDescription: `${business.name} provides professional ${business.category} services in ${business.location}. With years of experience, we deliver quality solutions tailored to your needs. Contact us today for exceptional service.`,
    suggestedPosts: [
      `🎉 Welcome to ${business.name}! Your trusted ${business.category} expert in ${business.location}. We're here to serve all your needs!`,
      `📍 Located in the heart of ${business.location}, ${business.name} is dedicated to providing top-notch ${business.category} services. Visit us today!`,
      `⭐ Thank you for choosing ${business.name}! Your satisfaction is our priority. Review us on Google to help others discover our ${business.category} services in ${business.location}.`
    ],
    reviewResponses: [
      { review: "Amazing service! Highly recommend.", response: "Thank you for the stellar review! We're delighted you had a great experience with us. We look forward to serving you again!" },
      { review: "Professional and timely. Will use again.", response: "We appreciate your feedback! It's great to know we met your expectations. Don't hesitate to reach out anytime you need our services." }
    ],
    keywords,
    competitorInsights: "To outrank competitors: ensure complete Google Business Profile, respond to all reviews, post weekly, use relevant categories, add photos regularly, and maintain consistent NAP information across directories."
  };
}