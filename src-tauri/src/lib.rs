mod commands;
mod config;
mod fan_controller;
mod hardware;
mod models;

use models::AppState;
use std::panic;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let default_hook = panic::take_hook();
    panic::set_hook(Box::new(move |info| {
        eprintln!("CRITICAL ERROR: App panicked!");
        fan_controller::force_auto_on_fail();
        default_hook(info);
    }));

    let app_state = AppState::new();
    fan_controller::start_fan_control_loop(app_state.clone());

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::set_fan_mode,
            commands::get_system_stats,
            commands::get_config,
            commands::save_config
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                println!("App closing via X button...");
                fan_controller::force_auto_on_fail();
            }
        });
}
