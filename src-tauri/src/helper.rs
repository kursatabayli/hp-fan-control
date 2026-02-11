use std::env;
use std::fs;
use std::path::PathBuf;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 3 {
        print_usage();
        process::exit(1);
    }

    let hwmon_path = find_hp_hwmon_dir().unwrap_or_else(|| {
        eprintln!("Error: 'hp' sensor hwmon directory not found!");
        process::exit(1);
    });

    let command = args[1].as_str();

    match command {
        "mode" => {
            let val = match args[2].as_str() {
                "max" => "0",
                "manual" => "1",
                "auto" => "2",
                _ => {
                    eprintln!("Invalid mode. Use: auto, max, manual");
                    process::exit(1);
                }
            };

            let target = hwmon_path.join("pwm1_enable");
            write_to_file(&target, val);
            println!("Mode set to {} ({})", args[2], val);
        }
        "speed" => {
            if args.len() < 4 {
                eprintln!("Usage: hp-fan-helper speed <cpu|gpu> <value>");
                process::exit(1);
            }

            let fan_file = match args[2].as_str() {
                "cpu" => "pwm1",
                "gpu" => "pwm2",
                _ => {
                    eprintln!("Invalid fan. Use: cpu, gpu");
                    process::exit(1);
                }
            };

            let pwm_val = &args[3];

            if let Ok(val) = pwm_val.parse::<u8>() {
                let target = hwmon_path.join(fan_file);
                write_to_file(&target, &val.to_string());
                println!("{} speed set to {}", fan_file, val);
            } else {
                eprintln!("Invalid PWM value. Must be 0-255.");
                process::exit(1);
            }
        }
        _ => {
            print_usage();
            process::exit(1);
        }
    }
}

fn print_usage() {
    eprintln!("Usage:");
    eprintln!("  Set Mode:  hp-fan-helper mode <auto|max|manual>");
    eprintln!("  Set Speed: hp-fan-helper speed <cpu|gpu> <0-255>");
}

fn write_to_file(path: &PathBuf, content: &str) {
    if let Err(e) = fs::write(path, content) {
        eprintln!("Failed to write to {:?}: {}", path, e);
        process::exit(1);
    }
}

fn find_hp_hwmon_dir() -> Option<PathBuf> {
    let base = std::path::Path::new("/sys/class/hwmon");
    fs::read_dir(base).ok()?.flatten().find_map(|entry| {
        let path = entry.path();
        let name_path = path.join("name");

        if let Ok(name) = fs::read_to_string(name_path) {
            if name.trim() == "hp" {
                return Some(path);
            }
        }
        None
    })
}
