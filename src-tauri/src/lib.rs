mod commands;
mod hardware;
mod models;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(models::AppState::new())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::set_fan_mode,
            commands::get_system_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
