#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Default, Clone)]
struct Store {
    devices: Vec<serde_json::Value>,
    profiles: Vec<serde_json::Value>,
}

fn store_path(app: &AppHandle) -> PathBuf {
    app.path_resolver()
        .app_config_dir()
        .unwrap_or_else(|| app.path_resolver().app_data_dir().unwrap())
        .join("esim_profiles.json")
}

#[tauri::command]
fn load_store(app: AppHandle) -> Store {
    let p = store_path(&app);
    if let Ok(text) = fs::read_to_string(&p) {
        if let Ok(parsed) = serde_json::from_str::<Store>(&text) {
            return parsed;
        }
    }
    Store::default()
}

#[tauri::command]
fn save_store(app: AppHandle, store: Store) -> Result<(), String> {
    let p = store_path(&app);
    if let Some(parent) = p.parent() {
        let _ = fs::create_dir_all(parent);
    }
    serde_json::to_string_pretty(&store)
        .map_err(|e| e.to_string())
        .and_then(|s| fs::write(&p, s).map_err(|e| e.to_string()))
}

#[tauri::command]
fn select_file() -> Result<String, String> {
    tauri::api::dialog::blocking::FileDialogBuilder::new()
        .pick_file()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "no file selected".to_string())
}

#[tauri::command]
fn save_text(text: String) -> Result<String, String> {
    let file = tauri::api::path::download_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(format!("{}.txt", chrono::Utc::now().timestamp_millis()));
    fs::write(&file, text).map_err(|e| e.to_string())?;
    Ok(file.to_string_lossy().to_string())
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_store, save_store, select_file, save_text, read_text_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
