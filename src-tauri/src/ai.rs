use crate::{AIReportResult, ReviewResponse, SEOAnalysisInput};
use log::{info, warn, error};
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AIError {
    #[error("Model not loaded")]
    ModelNotLoaded,
    #[error("Failed to load model: {0}")]
    LoadError(String),
    #[error("Generation error: {0}")]
    GenerationError(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

pub struct LocalAIService {
    model_loaded: bool,
    model_name: String,
    model_path: String,
}

impl LocalAIService {
    pub fn new(model_dir: &str) -> Result<Self, AIError> {
        info!("Creating AI service with model directory: {}", model_dir);
        
        let service = LocalAIService {
            model_loaded: false,
            model_name: "SEOCRATE-4B-Q4_K_M".to_string(),
            model_path: model_dir.to_string(),
        };
        
        Ok(service)
    }
    
    pub fn is_loaded(&self) -> bool {
        self.model_loaded
    }
    
    pub fn get_model_name(&self) -> String {
        self.model_name.clone()
    }
    
    pub fn generate_report(&self, input: &SEOAnalysisInput) -> Result<AIReportResult, AIError> {
        if !self.model_loaded {
            warn!("Model not loaded, using fallback generation");
            return self.generate_fallback_report(input);
        }
        
        info!("Generating report with AI model for: {}", input.business_name);
        
        let prompt = self.build_report_prompt(input);
        let recommendations = self.generate_with_prompt(&prompt, 800)?;
        
        let desc_prompt = format!(
            "Generate a 350-400 character Google Business Profile description for {} ({} in {}). \
            Make it compelling with keywords and a call to action.",
            input.business_name, input.business_category, input.business_location
        );
        let suggested_description = self.generate_with_prompt(&desc_prompt, 150)?.chars().take(400).collect();
        
        let posts_prompt = format!(
            "Generate 3 engaging social media post ideas for {} ({} in {}). \
            Each post should be 100-200 characters with emojis. Return as JSON array.",
            input.business_name, input.business_category, input.business_location
        );
        let posts_text = self.generate_with_prompt(&posts_prompt, 300)?;
        let suggested_posts = self.parse_posts(&posts_text);
        
        let review_prompt = "Generate professional review responses for: 1) 5-star 'Great service!' 2) 3-star 'Okay but slow' 3) 1-star 'Disappointed'. Return as JSON array with review and response fields.";
        let review_text = self.generate_with_prompt(review_prompt, 300)?;
        let review_responses = self.parse_reviews(&review_text);
        
        let keywords_prompt = format!(
            "Extract 10 SEO keywords from: Title: '{}', Description: '{}', Headings: {}. Return as comma-separated list.",
            input.title.as_deref().unwrap_or(""),
            input.meta_description.as_deref().unwrap_or(""),
            input.h1_tags.join(", ")
        );
        let keywords_text = self.generate_with_prompt(&keywords_prompt, 100)?;
        let keywords: Vec<String> = keywords_text
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .take(10)
            .collect();
        
        let competitor_prompt = format!(
            "Generate competitor analysis for a {} business called '{}' in {}. \
            Focus on: outrank tactics, differentiators, weaknesses to exploit, local SEO tips. Bullet points.",
            input.business_category, input.business_name, input.business_location
        );
        let competitor_insights = self.generate_with_prompt(&competitor_prompt, 300)?;
        
        Ok(AIReportResult {
            recommendations,
            suggested_description,
            suggested_posts,
            review_responses,
            keywords,
            competitor_insights,
        })
    }
    
    fn generate_fallback_report(&self, input: &SEOAnalysisInput) -> Result<AIReportResult, AIError> {
        info!("Generating fallback (rule-based) report");
        
        let mut recommendations = String::new();
        
        recommendations.push_str("## SEO Recommendations\n\n");
        
        if input.title.is_none() || input.title.as_ref().map(|s| s.is_empty()).unwrap_or(true) {
            recommendations.push_str("- Add a descriptive title tag (50-60 characters)\n");
        }
        
        if input.meta_description.is_none() || input.meta_description.as_ref().map(|s| s.is_empty()).unwrap_or(true) {
            recommendations.push_str("- Add a meta description (150-160 characters)\n");
        }
        
        if input.h1_tags.is_empty() {
            recommendations.push_str("- Add at least one H1 heading with target keyword\n");
        }
        
        if !input.has_schema {
            recommendations.push_str("- Add structured data (JSON-LD schema) for local business\n");
        }
        
        let images_without_alt = input.keywords.len();
        if images_without_alt == 0 {
            recommendations.push_str("- Add keywords to your content\n");
        }
        
        if input.word_count < 300 {
            recommendations.push_str(&format!("- Expand content (only {} words, aim for 500+)\n", input.word_count));
        }
        
        recommendations.push_str("\n## Technical Checklist\n\n");
        recommendations.push_str("- [ ] XML sitemap submitted to Google Search Console\n");
        recommendations.push_str("- [ ] Robots.txt allows crawling\n");
        recommendations.push_str("- [ ] Page speed under 3 seconds\n");
        recommendations.push_str("- [ ] Mobile responsive design\n");
        recommendations.push_str("- [ ] HTTPS enabled\n");
        
        Ok(AIReportResult {
            recommendations,
            suggested_description: format!(
                "{} - Professional {} services in {}. Contact us today for exceptional service and quality solutions tailored to your needs.",
                input.business_name, input.business_category, input.business_location
            ),
            suggested_posts: vec![
                format!("🎉 Discover quality {} services at {} in {}! Contact us today.", 
                    input.business_category, input.business_name, input.business_location),
                format!("📍 Visit {} - Your trusted {} expert in {}. We're here to serve!", 
                    input.business_name, input.business_category, input.business_location),
                format!("⭐ Thank you for choosing {}! Your satisfaction is our priority.", 
                    input.business_name),
            ],
            review_responses: vec![
                ReviewResponse {
                    review: "Great service and friendly staff!".to_string(),
                    response: "Thank you so much for the kind words! We're delighted you had a great experience.".to_string(),
                },
                ReviewResponse {
                    review: "It was okay, but the wait was a bit long.".to_string(),
                    response: "Thank you for your feedback. We apologize for the wait and are working to improve.".to_string(),
                },
                ReviewResponse {
                    review: "I was very disappointed with the quality.".to_string(),
                    response: "We are very sorry to hear about your experience. Please contact us directly so we can make things right.".to_string(),
                },
            ],
            keywords: vec![
                format!("{} {}", input.business_category, input.business_location),
                format!("{} {}", input.business_name, "reviews"),
                format!("best {} {}", input.business_category, input.business_location),
            ],
            competitor_insights: "Monitor competitor Google Business profiles, track their reviews, analyze keywords, and observe posting frequency to stay competitive.".to_string(),
        })
    }
    
    fn build_report_prompt(&self, input: &SEOAnalysisInput) -> String {
        let mut prompt = format!(
            "You are an expert SEO consultant. Generate a comprehensive SEO recommendations report.\n\n\
            Business: {} ({})\n\
            Location: {}\n",
            input.business_name, input.business_category, input.business_location
        );
        
        if let Some(ref website) = input.website {
            prompt.push_str(&format!("Website: {}\n", website));
        }
        
        prompt.push_str("\n## Website Audit Data\n");
        
        if let Some(ref title) = input.title {
            prompt.push_str(&format!("Title: {} ({} chars)\n", title, title.len()));
        }
        
        if let Some(ref desc) = input.meta_description {
            prompt.push_str(&format!("Meta Description: {} ({} chars)\n", desc, desc.len()));
        }
        
        if !input.h1_tags.is_empty() {
            prompt.push_str(&format!("H1 Tags: {}\n", input.h1_tags.join(", ")));
        }
        
        if !input.h2_tags.is_empty() {
            prompt.push_str(&format!("H2 Tags: {}\n", input.h2_tags.join(", ")));
        }
        
        prompt.push_str(&format!("Word Count: {}\n", input.word_count));
        prompt.push_str(&format!("Has Schema: {}\n", if input.has_schema { "Yes" } else { "No" }));
        prompt.push_str(&format!("Internal Links: {}\n", input.internal_links));
        prompt.push_str(&format!("External Links: {}\n", input.external_links));
        
        prompt.push_str("\nGenerate specific, actionable recommendations based on this data.\n");
        
        prompt
    }
    
    fn generate_with_prompt(&self, prompt: &str, max_tokens: u32) -> Result<String, AIError> {
        info!("Generating text with prompt length: {} chars", prompt.len());
        
        let simplified = format!(
            "{}\n\nResponse:",
            prompt.chars().take(1000).collect::<String>()
        );
        
        Ok(simplified)
    }
    
    fn parse_posts(&self, text: &str) -> Vec<String> {
        if let Some(start) = text.find('[') {
            if let Some(end) = text.rfind(']') {
                let json = &text[start..=end];
                if let Ok(posts) = serde_json::from_str::<Vec<String>>(json) {
                    return posts;
                }
            }
        }
        
        vec![
            format!("🎉 Check out our new services! We're proud to serve our community."),
            format!("📍 Visit us today! We're dedicated to providing top-notch services."),
            format!("⭐ Thank you for choosing us! Your satisfaction is our priority."),
        ]
    }
    
    fn parse_reviews(&self, text: &str) -> Vec<ReviewResponse> {
        if let Some(start) = text.find('[') {
            if let Some(end) = text.rfind(']') {
                let json = &text[start..=end];
                if let Ok(responses) = serde_json::from_str::<Vec<ReviewResponse>>(json) {
                    return responses;
                }
            }
        }
        
        vec![
            ReviewResponse {
                review: "Great service!".to_string(),
                response: "Thank you so much for the kind words!".to_string(),
            },
        ]
    }
}
