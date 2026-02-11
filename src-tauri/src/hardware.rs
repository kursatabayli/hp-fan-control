use nvml_wrapper::enum_wrappers::device::TemperatureSensor;
use nvml_wrapper::Nvml;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;

static NVML_INSTANCE: OnceLock<Option<Nvml>> = OnceLock::new();
static NVIDIA_BUS_ID: OnceLock<Option<String>> = OnceLock::new();

static HP_HWMON_PATH: OnceLock<Option<PathBuf>> = OnceLock::new();
static CPU_TEMP_PATH: OnceLock<Option<PathBuf>> = OnceLock::new();
static AMDGPU_TEMP_PATH: OnceLock<Option<PathBuf>> = OnceLock::new();

fn find_hwmon_by_name(target_names: &[&str]) -> Option<PathBuf> {
    let base_path = Path::new("/sys/class/hwmon");
    let entries = fs::read_dir(base_path).ok()?;

    for entry in entries.flatten() {
        let path = entry.path();
        let name_path = path.join("name");

        if let Ok(content) = fs::read_to_string(name_path) {
            let name = content.trim();
            if target_names.contains(&name) {
                return Some(path);
            }
        }
    }
    None
}

fn read_and_parse<T: std::str::FromStr>(path: &Path) -> Option<T> {
    fs::read_to_string(path)
        .ok()
        .and_then(|c| c.trim().parse::<T>().ok())
}

pub fn get_fan_rpms() -> (u16, u16) {
    let path_opt = HP_HWMON_PATH.get_or_init(|| find_hwmon_by_name(&["hp"]));

    if let Some(path) = path_opt {
        let cpu_rpm = read_and_parse::<u32>(&path.join("fan1_input"))
            .unwrap_or(0)
            .min(65535) as u16;

        let gpu_rpm = read_and_parse::<u32>(&path.join("fan2_input"))
            .unwrap_or(0)
            .min(65535) as u16;

        return (cpu_rpm, gpu_rpm);
    }
    (0, 0)
}

pub fn get_cpu_temp() -> u8 {
    let path_opt = CPU_TEMP_PATH.get_or_init(|| {
        let possible_drivers = ["coretemp", "k10temp", "zenpower", "k10temp_tctl"];
        if let Some(hwmon) = find_hwmon_by_name(&possible_drivers) {
            let t1 = hwmon.join("temp1_input");
            if t1.exists() {
                return Some(t1);
            }

            let t2 = hwmon.join("temp2_input");
            if t2.exists() {
                return Some(t2);
            }
        }
        None
    });

    if let Some(path) = path_opt {
        if let Some(milli_temp) = read_and_parse::<i32>(path) {
            return (milli_temp / 1000).clamp(0, 255) as u8;
        }
    }
    0
}

pub fn get_gpu_temp() -> Option<u8> {
    if let Some(status_path) = get_nvidia_status_path() {
        let is_awake = fs::read_to_string(&status_path)
            .map(|s| s.trim() == "active")
            .unwrap_or(false);

        if is_awake {
            let nvml_opt = NVML_INSTANCE.get_or_init(|| Nvml::init().ok());
            if let Some(nvml) = nvml_opt {
                if let Ok(device) = nvml.device_by_index(0) {
                    if let Ok(temp) = device.temperature(TemperatureSensor::Gpu) {
                        return Some(temp.clamp(0, 255) as u8);
                    }
                }
            }
        }
    }

    let amd_path_opt = AMDGPU_TEMP_PATH
        .get_or_init(|| find_hwmon_by_name(&["amdgpu"]).map(|p| p.join("temp1_input")));

    if let Some(path) = amd_path_opt {
        if let Some(milli_temp) = read_and_parse::<i32>(path) {
            return Some((milli_temp / 1000).clamp(0, 255) as u8);
        }
    }

    None
}

fn get_nvidia_bus_id() -> Option<&'static String> {
    NVIDIA_BUS_ID
        .get_or_init(|| {
            let pci_root = Path::new("/sys/bus/pci/devices");
            if let Ok(entries) = fs::read_dir(pci_root) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    let vendor_path = path.join("vendor");
                    if let Ok(vendor) = fs::read_to_string(vendor_path) {
                        if vendor.trim() == "0x10de" {
                            return path
                                .file_name()
                                .and_then(|n| n.to_str())
                                .map(|s| s.to_string());
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
