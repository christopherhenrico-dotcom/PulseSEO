use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use log::{info, error};

mod ai;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SEOAnalysisInput {
    pub business_name: String,
    pub business_category: String,
    pub business_location: String,
    pub website: Option<String>,
    pub title: Option<String>,
    pub meta_description: Option<String>,
    pub h1_tags: Vec<String>,
    pub h2_tags: Vec<String>,
    pub keywords: Vec<String>,
    pub word_count: i32,
    pub has_schema: bool,
    pub internal_links: i32,
    pub external_links: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIReportResult {
    pub recommendations: String,
    pub suggested_description: String,
    pub suggested_posts: Vec<String>,
    pub review_responses: Vec<ReviewResponse>,
    pub keywords: Vec<String>,
    pub competitor_insights: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewResponse {
    pub review: String,
    pub response: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIServiceStatus {
    pub initialized: bool,
    pub model_loaded: bool,
    pub model_name: String,
}

pub struct AppState {
    pub ai_service: Mutex<Option<ai::LocalAIService>>,
}

#[tauri::command]
async fn initialize_ai(
    state: State<'_, AppState>,
    model_path: Option<String>,
) -> Result<AIServiceStatus, String> {
    info!("Initializing AI service...");
    
    let model = model_path.unwrap_or_else(|| "models/".to_string());
    
    match ai::LocalAIService::new(&model) {
        Ok(service) => {
            let status = AIServiceStatus {
                initialized: true,
                model_loaded: service.is_loaded(),
                model_name: service.get_model_name(),
            };
            
            let mut ai = state.ai_service.lock().map_err(|e| e.to_string())?;
            *ai = Some(service);
            
            info!("AI service initialized successfully");
            Ok(status)
        }
        Err(e) => {
            error!("Failed to initialize AI: {}", e);
            Err(format!("Failed to initialize AI: {}", e))
        }
    }
}

#[tauri::command]
async fn get_ai_status(state: State<'_, AppState>) -> Result<AIServiceStatus, String> {
    let ai = state.ai_service.lock().map_err(|e| e.to_string())?;
    
    match ai.as_ref() {
        Some(service) => Ok(AIServiceStatus {
            initialized: true,
            model_loaded: service.is_loaded(),
            model_name: service.get_model_name(),
        }),
        None => Ok(AIServiceStatus {
            initialized: false,
            model_loaded: false,
            model_name: "Not loaded".to_string(),
        }),
    }
}

#[tauri::command]
async fn generate_seo_report(
    state: State<'_, AppState>,
    input: SEOAnalysisInput,
) -> Result<AIReportResult, String> {
    info!("Generating SEO report for: {}", input.business_name);
    
    let ai = state.ai_service.lock().map_err(|e| e.to_string())?;
    
    match ai.as_ref() {
        Some(service) => {
            service.generate_report(&input).map_err(|e| e.to_string())
        }
        None => {
            Err("AI service not initialized. Call initialize_ai first.".to_string())
        }
    }
}

#[tauri::command]
async fn generate_text(
    state: State<'_, AppState>,
    prompt: String,
    max_tokens: Option<u32>,
) -> Result<String, String> {
    let ai = state.ai_service.lock().map_err(|e| e.to_string())?;
    
    match ai.as_ref() {
        Some(service) => {
            service.generate_text(&prompt, max_tokens.unwrap_or(500)).map_err(|e| e.to_string())
        }
        None => {
            Err("AI service not initialized".to_string())
        }
    }
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            ai_service: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            initialize_ai,
            get_ai_status,
            generate_seo_report,
            generate_text,
            get_app_version,
        ])
        .setup(|app| {
            info!("PulseSEO Desktop v{} starting...", env!("CARGO_PKG_VERSION"));
            
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.open_devtools();
                }
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
