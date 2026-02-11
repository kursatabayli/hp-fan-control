use crate::config::{self, FanConfig, FanMode};
use crate::fan_controller;
use crate::hardware;
use crate::models::{AppState, SystemStats};
use tauri::State;

#[tauri::command]
pub fn get_system_stats() -> SystemStats {
    let (cpu_fan_rpm, gpu_fan_rpm) = hardware::get_fan_rpms();
    let cpu_temp = hardware::get_cpu_temp();

    let gpu_temp = hardware::get_gpu_temp().unwrap_or(cpu_temp);

    SystemStats {
        cpu_temp,
        gpu_temp,
        cpu_fan_rpm,
        gpu_fan_rpm,
    }
}

#[tauri::command]
pub fn set_fan_mode(mode: String, state: State<AppState>) -> Result<String, String> {
    let mut state_guard = state.inner.write().map_err(|_| "Lock poisoned")?;

    match mode.as_str() {
        "max" => {
            state_guard.mode = FanMode::Max;
            state_guard.config.last_mode = FanMode::Max;
            fan_controller::apply_fan_mode("max")?;

            config::save_config(&state_guard.config);

            Ok("Max mode activated.".into())
        }
        "manual" => {
            state_guard.mode = FanMode::Manual;
            state_guard.config.last_mode = FanMode::Manual;
            fan_controller::apply_fan_mode("manual")?;

            config::save_config(&state_guard.config);

            Ok("Manual mode activated.".into())
        }
        "auto" | _ => {
            state_guard.mode = FanMode::Auto;
            state_guard.config.last_mode = FanMode::Auto;
            fan_controller::apply_fan_mode("auto")?;

            config::save_config(&state_guard.config);

            Ok("Auto mode activated.".into())
        }
    }
}

#[tauri::command]
pub fn get_config(state: State<AppState>) -> Result<FanConfig, String> {
    let state_guard = state.inner.read().map_err(|_| "Lock poisoned")?;
    Ok(state_guard.config.clone())
}

#[tauri::command]
pub fn save_config(config: FanConfig, state: State<AppState>) -> Result<(), String> {
    let mut state_guard = state.inner.write().map_err(|_| "Lock poisoned")?;

    let current_mode = state_guard.mode;

    state_guard.config = config.clone();
    state_guard.config.last_mode = current_mode;

    config::save_config(&state_guard.config);

    Ok(())
}
