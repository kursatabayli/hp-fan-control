# HP Fan Control (Linux)

![Platform](https://img.shields.io/badge/platform-Linux-green.svg)

A modern Linux desktop application designed for **HP Victus** series laptops, allowing you to take full control of your thermal management.

## 🚨 Prerequisites (READ THIS FIRST)

> [!IMPORTANT]
> **This application WILL NOT WORK without the custom Kernel Driver.**
> Linux does not allow manual fan control on HP gaming laptops by default. You must install the kernel module first.

Before installing this app, you **must** install the **HP WMI Driver** which exposes the fan PWM controls to the OS.

1.  Go to the driver repository: **[hp-wmi-driver](https://github.com/kursatabayli/hp-wmi-driver)**
2.  Follow the installation instructions there.
3.  Ensure you have added your user to the `hpfan` group.

---

## Features

-   **Manual Curve Editor:** Create custom fan curves for CPU and GPU independently with an interactive graph.
-   **Max Mode:** Instantly boosts fans to maximum RPM for peak cooling.
-   **Fail-Safe System:** Automatically reverts fans to "Auto" mode if the application crashes or closes.
-   **Persistence:** Remembers your last used mode and curves on startup.
-   **Live Monitoring:** Displays real-time CPU and GPU temperatures and Fan RPMs.

---

## Installation

1.  Download the latest release from the **[Releases Page](https://github.com/kursatabayli/hp-fan-control/releases)**.
2.  Extract the archive.
3.  Open a terminal in the folder and run the installer:

```sh
sudo ./install.sh
```

Once installed, you will see the **"HP Fan Control"** icon in your application menu.

---

## Test Environment

This software has been developed and verified on the following hardware and software configuration:

| Component  | Detail                    |
| :--------- | :------------------------ |
| **Device** | **HP Victus 16-s0xxx**    |
| **OS**     | **Fedora Workstation 43** |
| **Kernel** | **Linux 6.18.8**          |

---

## Compatibility

| Hardware | Status | Notes |
| :--- | :--- | :--- |
| **HP Victus 16 (s0xxx)** | Verified | Primary development device. Works perfectly. |
| **HP Victus 15** | Unknown | Should work if the WMI path is the same. |
| **HP Omen Series** | Unknown | Architecture is similar, but untested. Feedback welcome. |

| OS / Distro | Status | Notes |
| :--- | :--- | :--- |
| **Fedora 43** | Verified | Primary development OS. |
| **Ubuntu / Debian** | Likely | Requires `dkms` and correct dependencies for the driver. |

---


## ⚠️ Disclaimer

This software modifies hardware fan settings via a custom kernel module. The software is provided "as is". Running fans at maximum speed continuously or setting them too low during high loads may affect hardware lifespan. The developer cannot be held responsible for any hardware or software issues that may arise from use.

---

### 📄 License

This project is licensed under the [GPL-3.0 License](https://github.com/kursatabayli/hp-fan-control/blob/develop/LICENSE)
