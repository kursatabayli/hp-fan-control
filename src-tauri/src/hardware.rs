use crate::models::FanSensor;
use std::fs;
use std::path::{Path, PathBuf};

pub fn find_hwmon_by_name(target_name: &str) -> Option<PathBuf> {
    let base_path = Path::new("/sys/class/hwmon");
    let entries = fs::read_dir(base_path).ok()?;

    for entry in entries.flatten() {
        let path = entry.path();
        let name_path = path.join("name");

        if let Ok(content) = fs::read_to_string(name_path) {
            if content.trim() == target_name {
                return Some(path);
            }
        }
    }
    None
}

pub fn scan_fans(base_path: &Path) -> Vec<FanSensor> {
    let mut fans = Vec::new();

    if let Ok(entries) = fs::read_dir(base_path) {
        for entry in entries.flatten() {
            let path = entry.path();

            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                if file_name.starts_with("fan") && file_name.ends_with("_input") {
                    let rpm = fs::read_to_string(&path)
                        .ok()
                        .and_then(|c| c.trim().parse().ok())
                        .unwrap_or(0);

                    let clean_id = file_name.replace("_input", "");

                    fans.push(FanSensor { id: clean_id, rpm });
                }
            }
        }
    }

    fans.sort_by(|a, b| a.id.cmp(&b.id));

    fans
}
