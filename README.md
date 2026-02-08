# HP Fan Control (Linux)

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

A modern Linux desktop application designed for **HP Victus** series laptops, allowing you to switch fan speeds between **Maximum (Max)** and **Automatic (Auto)** modes.

It is designed to bridge the gap of the missing fan control features from _Omen Gaming Hub_ on Linux.

## Features

- **Max Performance Mode:** Instantly boosts fans to maximum RPM for peak cooling with a single click.
- **Automatic Mode:** Returns fan control to the system (BIOS).
- **Live Monitoring:** Displays real-time CPU and GPU fan speeds (RPM).
- **Dynamic Detection:** Automatically scans and lists available fan sensors.

## Test Environment & Compatibility

This software has been developed and verified on the following hardware and software configuration:

| Component  | Detail                    |
| :--------- | :------------------------ |
| **Device** | **HP Victus 16-s0xxx**    |
| **OS**     | **Fedora Workstation 43** |
| **Kernel** | **Linux 6.18.8**          |

### Support Status

- ✅ **HP Victus:** Fully supported (Tested).
- ❓ **HP Omen:** While the software architecture is similar, **HP Omen series devices have not been tested.** Omen users may try the application at their own risk.

---

## Installation

### Method 1: Fedora (Recommended)

A ready-to-use `.rpm` package is available for Fedora users.

1.  Download the lastest `.rpm` file from the **[Releases](https://github.com/kursatabayli/hp-fan-control/releases)** page.
2.  Open your terminal and install the package:

```sh
sudo dnf install ./hp-fan-control-*.rpm
```

### Method 2: Other Distributions

> [!WARNING]
> **Experimental Support:** This application has been developed and **verified primarily on Fedora Linux.**
While the universal installer is designed to work on other distributions (Ubuntu, Debian, Arch, Mint, etc.), they have **not been officially verified**. Please use with caution and report any issues.
For Ubuntu, Debian, Arch, Mint, or other distributions, you can use the `*.tar.xz` package.

1.  Download the lastest `*.tar.xz` file from the **[Releases](https://github.com/kursatabayli/hp-fan-control/releases)** page.
2.  Extract the file and navigate into the folder via terminal.
3.  Run the installation script:

```sh
sudo ./install.sh
```

Once installed, you will see the **"HP Fan Control"** icon in your application menu.

---

## Uninstall

To completely remove the application from your system:

**If installed via RPM:**

```sh
sudo dnf remove hp-fan-control
```

**If installed via Universal Installer:**
Run the uninstall script located in the installation folder:

```sh
sudo ./uninstall.sh
```

---

## ⚠️ Disclaimer

This software modifies hardware fan settings. The software is provided "as is". Running fans at maximum speed continuously may affect hardware lifespan or cause noise. The developer cannot be held responsible for any hardware or software issues that may arise from use.

---

### 📄 License

This project is licensed under the [MIT License](https://github.com/kursatabayli/hp-fan-control/blob/main/LICENSE)
