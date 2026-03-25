/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { BusinessInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeBusiness(business: BusinessInfo) {
  const model = "gemini-3-flash-preview";
  
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

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seoScore: { type: Type.NUMBER },
          gmbOptimized: { type: Type.BOOLEAN },
          recommendations: { type: Type.STRING },
          suggestedDescription: { type: Type.STRING },
          suggestedPosts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          reviewResponses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                review: { type: Type.STRING },
                response: { type: Type.STRING }
              },
              required: ["review", "response"]
            }
          }
        },
        required: ["seoScore", "gmbOptimized", "recommendations", "suggestedDescription", "suggestedPosts", "reviewResponses"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
