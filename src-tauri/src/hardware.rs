use nvml_wrapper::enum_wrappers::device::TemperatureSensor;
use nvml_wrapper::Nvml;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

static NVML_INSTANCE: OnceLock<Option<Nvml>> = OnceLock::new();
static NVIDIA_BUS_ID: OnceLock<Option<String>> = OnceLock::new();

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

pub fn get_fan_rpms() -> (i32, i32) {
    let mut cpu_rpm = 0;
    let mut gpu_rpm = 0;

    if let Some(path) = find_hwmon_by_name("hp") {
        let fan1_path = path.join("fan1_input");
        if let Ok(content) = fs::read_to_string(fan1_path) {
            cpu_rpm = content.trim().parse().unwrap_or(0);
        }

        let fan2_path = path.join("fan2_input");
        if let Ok(content) = fs::read_to_string(fan2_path) {
            gpu_rpm = content.trim().parse().unwrap_or(0);
        }
    }
    (cpu_rpm, gpu_rpm)
}

fn get_nvidia_bus_id() -> Option<&'static String> {
    NVIDIA_BUS_ID
        .get_or_init(|| {
            let pci_root = Path::new("/sys/bus/pci/devices");
            if let Ok(entries) = fs::read_dir(pci_root) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    let vendor_path = path.join("vendor");
                    if let Ok(vendor_content) = fs::read_to_string(vendor_path) {
                        if vendor_content.trim() == "0x10de" {
                            if let Some(bus_id) = path.file_name().and_then(|n| n.to_str()) {
                                return Some(bus_id.to_string());
                            }
                        }
                    }
                }
            }
            None
        })
        .as_ref()
}

pub fn get_nvidia_status_path() -> Option<PathBuf> {
    if let Some(bus_id) = get_nvidia_bus_id() {
        return Some(
            Path::new("/sys/bus/pci/devices")
                .join(bus_id)
                .join("power/runtime_status"),
        );
    }
    None
}

fn read_temp_file(path: PathBuf) -> Option<i32> {
    if let Ok(content) = fs::read_to_string(path) {
        if let Ok(milli_temp) = content.trim().parse::<i32>() {
            return Some(milli_temp / 1000);
        }
    }
    None
}

fn get_integrated_gpu_temp() -> Option<i32> {
    if let Some(path) = find_hwmon_by_name("amdgpu") {
        if let Some(temp) = read_temp_file(path.join("temp1_input")) {
            return Some(temp);
        }
    }
    None
}

pub fn get_cpu_temp() -> i32 {
    let sensor_names = ["coretemp", "k10temp", "zenpower"];

    for &name in &sensor_names {
        if let Some(path) = find_hwmon_by_name(name) {
            if let Some(temp) = read_temp_file(path.join("temp1_input")) {
                return temp;
            }
            if let Some(temp) = read_temp_file(path.join("temp2_input")) {
                return temp;
            }
        }
    }
    0
}

pub fn get_gpu_temp() -> Option<i32> {
    if let Some(status_path) = get_nvidia_status_path() {
        let is_awake = if let Ok(status) = fs::read_to_string(&status_path) {
            status.trim() == "active"
        } else {
            false
        };

        if is_awake {
            let nvml_opt = NVML_INSTANCE.get_or_init(|| Nvml::init().ok());
            if let Some(nvml) = nvml_opt {
                if let Ok(device) = nvml.device_by_index(0) {
                    if let Ok(temp) = device.temperature(TemperatureSensor::Gpu) {
                        return Some(temp as i32);
                    }
                }
            }
        }
    }
    get_integrated_gpu_temp()
}
