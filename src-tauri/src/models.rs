use serde::Serialize;
use std::sync::{Arc, Mutex};

pub struct FanState {
    pub should_run_max: bool,
}

pub struct AppState(pub Arc<Mutex<FanState>>);

impl AppState {
    pub fn new() -> Self {
        AppState(Arc::new(Mutex::new(FanState {
            should_run_max: false,
        })))
    }
}

#[derive(Serialize, Clone)]
pub struct SystemStats {
    pub cpu_fan_rpm: i32,
    pub gpu_fan_rpm: i32,
    pub cpu_temp: i32,
    pub gpu_temp: i32,
}
