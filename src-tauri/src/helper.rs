use std::env;
use std::fs;
use std::path::PathBuf;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: hp-fan-helper <max|auto>");
        process::exit(1);
    }

    // DRY (Don't Repeat Yourself) Prensibi:
    // Normalde bu fonksiyonu library'den çağırmak en doğrusudur.
    // Ancak binary bağımsız olsun diye buraya embed ediyoruz.
    let hwmon_path = find_target_hwmon().unwrap_or_else(|| {
        eprintln!("Error: 'hp' sensor not found!");
        process::exit(1);
    });

    let (val, msg) = match args[1].as_str() {
        "max" => ("0", "MAX mode (0)"),
        "auto" => ("2", "AUTO mode (2)"),
        _ => {
            eprintln!("Invalid command");
            process::exit(1);
        }
    };

    println!("Setting {} on {:?}", msg, hwmon_path);

    if let Err(e) = fs::write(&hwmon_path, val) {
        eprintln!("Failed to write: {}", e);
        process::exit(1);
    }
}

fn find_target_hwmon() -> Option<PathBuf> {
    let base = std::path::Path::new("/sys/class/hwmon");
    fs::read_dir(base).ok()?.flatten().find_map(|entry| {
        let path = entry.path();
        let name = fs::read_to_string(path.join("name")).ok()?;
        if name.trim() == "hp" {
            let target = path.join("pwm1_enable");
            if target.exists() {
                Some(target)
            } else {
                None
            }
        } else {
            None
        }
    })
}
