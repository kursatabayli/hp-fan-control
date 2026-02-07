use crate::hardware;
use crate::models::{AppState, SystemStats};
use std::process::Command;
use std::thread;
use std::time::Duration;
use tauri::State;

const HELPER_PATH: &str = "/usr/local/bin/hp-fan-helper";

fn call_root_helper(mode: &str) -> Result<(), String> {
    let output = Command::new("pkexec")
        .arg(HELPER_PATH)
        .arg(mode)
        .output()
        .map_err(|e| format!("Failed to execute pkexec: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        let err_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Helper Error: {}", err_msg))
    }
}

#[tauri::command]
pub fn get_fan_speeds() -> SystemStats {
    let fans = if let Some(path) = hardware::find_hwmon_by_name("hp") {
        hardware::scan_fans(&path)
    } else {
        Vec::new()
    };

    SystemStats { fans }
}

#[tauri::command]
pub fn set_fan_mode(mode: String, state: State<AppState>) -> Result<String, String> {
    let mut fan_state = state.0.lock().map_err(|_| "Mutex poisoning")?;

    match mode.as_str() {
        "max" => {
            if fan_state.should_run_max {
                return Ok("Already in Max mode.".into());
            }

            call_root_helper("max")?;
            fan_state.should_run_max = true;

            let state_clone = state.0.clone();
            thread::spawn(move || loop {
                thread::sleep(Duration::from_secs(90));
                let current = state_clone.lock().unwrap();
                if !current.should_run_max {
                    break;
                }
                drop(current);
                let _ = call_root_helper("max");
            });

            Ok("Max mode activated.".into())
        }
        "auto" | _ => {
            fan_state.should_run_max = false;
            call_root_helper("auto")?;
            Ok("Switched to Auto mode.".into())
        }
    }
}