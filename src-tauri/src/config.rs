use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FanMode {
    Auto,
    Max,
    Manual,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CurvePoint {
    pub temp: u8,
    pub speed: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FanConfig {
    pub cpu_curve: Vec<CurvePoint>,
    pub gpu_curve: Vec<CurvePoint>,

    #[serde(default = "default_mode")]
    pub last_mode: FanMode,
}

fn default_mode() -> FanMode {
    FanMode::Auto
}

impl Default for FanConfig {
    fn default() -> Self {
        let default_curve = vec![
            CurvePoint {
                temp: 45,
                speed: 76,
            },
            CurvePoint {
                temp: 50,
                speed: 89,
            },
            CurvePoint {
                temp: 55,
                speed: 102,
            },
            CurvePoint {
                temp: 60,
                speed: 115,
            },
            CurvePoint {
                temp: 65,
                speed: 128,
            },
            CurvePoint {
                temp: 70,
                speed: 153,
            },
            CurvePoint {
                temp: 75,
                speed: 179,
            },
            CurvePoint {
                temp: 80,
                speed: 204,
            },
            CurvePoint {
                temp: 85,
                speed: 230,
            },
            CurvePoint {
                temp: 90,
                speed: 255,
            },
            CurvePoint {
                temp: 95,
                speed: 255,
            },
        ];

        FanConfig {
            cpu_curve: default_curve.clone(),
            gpu_curve: default_curve,
            last_mode: FanMode::Auto,
        }
    }
}

fn get_config_path() -> PathBuf {
    let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("hp-fan-control");
    fs::create_dir_all(&path).ok();
    path.push("config.json");
    path
}

pub fn load_config() -> FanConfig {
    let path = get_config_path();
    if let Ok(content) = fs::read_to_string(&path) {
        if let Ok(config) = serde_json::from_str(&content) {
            return config;
        }
    }
    let default_config = FanConfig::default();
    save_config(&default_config);
    default_config
}

pub fn save_config(config: &FanConfig) {
    let path = get_config_path();
    if let Ok(content) = serde_json::to_string_pretty(config) {
        let _ = fs::write(path, content);
    }
}
