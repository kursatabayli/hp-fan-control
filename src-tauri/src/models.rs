use crate::config::{self, FanConfig, FanMode};
use serde::Serialize;
use std::sync::{Arc, RwLock};

pub struct FanState {
    pub mode: FanMode,
    pub config: FanConfig,
}

#[derive(Clone)]
pub struct AppState {
    pub inner: Arc<RwLock<FanState>>,
}

impl AppState {
    pub fn new() -> Self {
        let loaded_config = config::load_config();
        let start_mode = loaded_config.last_mode;

        AppState {
            inner: Arc::new(RwLock::new(FanState {
                mode: start_mode,
                config: loaded_config,
            })),
        }
    }
}

#[derive(Debug, Serialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub struct SystemStats {
    pub cpu_fan_rpm: u16,
    pub gpu_fan_rpm: u16,
    pub cpu_temp: u8,
    pub gpu_temp: u8,
}
