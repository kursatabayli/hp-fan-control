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

#[derive(Serialize, Clone, Debug)]
pub struct FanSensor {
    pub id: String,
    pub rpm: i32,
}

#[derive(Serialize, Clone)]
pub struct SystemStats {
    pub fans: Vec<FanSensor>,
}
