use crate::config::{CurvePoint, FanMode};
use crate::hardware;
use crate::models::AppState;
use std::process::Command;
use std::thread;
use std::time::Duration;

const HELPER_PATH: &str = "/usr/bin/hp-fan-helper";

pub fn apply_fan_mode(mode: &str) -> Result<(), String> {
    let output = Command::new("pkexec")
        .arg(HELPER_PATH)
        .arg("mode")
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

pub fn force_auto_on_fail() {
    println!("Safety Guard: Forcing AUTO mode due to shutdown/panic...");
    let _ = Command::new("pkexec")
        .arg(HELPER_PATH)
        .arg("mode")
        .arg("auto")
        .spawn()
        .map(|mut child| child.wait());
}

pub fn start_fan_control_loop(state: AppState) {
    {
        if let Ok(guard) = state.inner.read() {
            match guard.mode {
                FanMode::Max => {
                    let _ = apply_fan_mode("max");
                }
                FanMode::Manual => {
                    let _ = apply_fan_mode("manual");
                }
                FanMode::Auto => {
                    let _ = apply_fan_mode("auto");
                }
            }
        }
    }

    thread::spawn(move || loop {
        let (mode, config) = {
            if let Ok(guard) = state.inner.read() {
                (guard.mode, guard.config.clone())
            } else {
                thread::sleep(Duration::from_millis(1000));
                continue;
            }
        };

        match mode {
            FanMode::Manual => {
                let cpu_temp = hardware::get_cpu_temp();
                let gpu_temp = hardware::get_gpu_temp().unwrap_or(cpu_temp);

                let cpu_pwm = calculate_speed(cpu_temp, &config.cpu_curve);
                let gpu_pwm = calculate_speed(gpu_temp, &config.gpu_curve);

                apply_fan_speed("cpu", cpu_pwm);
                apply_fan_speed("gpu", gpu_pwm);

                thread::sleep(Duration::from_secs(2));
            }
            _ => {
                thread::sleep(Duration::from_secs(8));
            }
        }
    });
}

fn apply_fan_speed(fan_type: &str, pwm: u8) {
    let _ = Command::new("pkexec")
        .arg(HELPER_PATH)
        .arg("speed")
        .arg(fan_type)
        .arg(pwm.to_string())
        .output();
}

fn calculate_speed(temp: u8, curve: &[CurvePoint]) -> u8 {
    if curve.is_empty() {
        return 150;
    }

    if temp <= curve.first().unwrap().temp {
        return curve.first().unwrap().speed;
    }

    if temp >= curve.last().unwrap().temp {
        return curve.last().unwrap().speed;
    }

    for w in curve.windows(2) {
        let p1 = &w[0];
        let p2 = &w[1];

        if temp >= p1.temp && temp <= p2.temp {
            let range = p2.temp as f32 - p1.temp as f32;
            let temp_diff = temp as f32 - p1.temp as f32;
            let percent = temp_diff / range;

            let speed_diff = p2.speed as f32 - p1.speed as f32;

            let result = p1.speed as f32 + (speed_diff * percent);
            return result.clamp(0.0, 255.0) as u8;
        }
    }

    255
}
