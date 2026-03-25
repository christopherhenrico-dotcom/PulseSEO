/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { BusinessInfo } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const ai = new GoogleGenerativeAI(API_KEY);

export async function analyzeBusiness(business: BusinessInfo) {
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `
    Perform a comprehensive Local SEO and Google My Business (GMB) audit for the following business:
    Name: ${business.name}
    Category: ${business.category}
    Location: ${business.location}
    Website: ${business.website || "N/A"}
    Current Description: ${business.description || "N/A"}

    Provide the following in JSON format:
    1. seoScore: (0-100)
    2. gmbOptimized: (boolean)
    3. recommendations: (markdown string with actionable steps)
    4. suggestedDescription: (SEO optimized business description)
    5. suggestedPosts: (array of 3 engaging GMB post ideas)
    6. reviewResponses: (array of 2 example reviews and professional AI-generated responses)
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return JSON.parse(text || "{}");
}
