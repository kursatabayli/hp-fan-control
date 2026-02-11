# HP Fan Control (Linux)

![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

A modern Linux desktop application designed for **HP Victus** series laptops, allowing you to take full control of your thermal management.

## 🚀 v0.3.0 Update: Manual Control is Here!

With the release of **v0.3.0**, you can now create custom fan curves for both CPU and GPU independently. However, this advanced functionality requires a **custom kernel driver** (included in the release).

> **⚠️ Which version should I choose?**
>
> * **Choose v0.3.0 (Recommended):** If you want **Manual Fan Curves**, persistence settings, and are okay with installing a DKMS kernel module.
> * **Choose v0.2.0:** If you only need **Max/Auto** toggle and do **not** want to install custom kernel drivers.

---

## Features (v0.3.0)

-   **Manual Curve Editor:** Create custom fan curves for CPU and GPU independently with an interactive graph.
-   **Max Performance Mode:** Instantly boosts fans to maximum RPM for peak cooling.
-   **Fail-Safe System:** Automatically reverts fans to "Auto" mode if the application crashes or closes.
-   **Persistence:** Remembers your last used mode and curves on startup.
-   **Live Monitoring:** Displays real-time CPU and GPU temperatures and Fan RPMs.

---

<<<<<<< HEAD
1.  Download the lastest `.rpm` file from the **[Releases](https://github.com/kursatabayli/hp-fan-control/releases)** page.
2.  Open your terminal and install the package:
=======
## 🔧 About the Kernel Driver & Credits
>>>>>>> d1f7363 (feat: Release v0.3.0 - Manual Fan Control & Curve Editor)

To enable manual fan control on HP Victus devices, this project utilizes a modified version of the `hp-wmi` driver.

**Core Implementation:**
The driver logic is based on the upcoming work by **Krishna Chomal** in the Linux Kernel `platform-drivers-x86` tree. This project stands on the shoulders of these upstream contributions:

* **[PATCH] [hp-wmi: add manual fan control for Victus S models](https://git.kernel.org/pub/scm/linux/kernel/git/pdx86/platform-drivers-x86.git/commit/drivers/platform/x86/hp/hp-wmi.c?h=for-next&id=46be1453e6e61884b4840a768d1e8ffaf01a4c1c)** *(Enables the raw PWM control interface)*
* **[PATCH] [hp-wmi: implement fan keep-alive](https://git.kernel.org/pub/scm/linux/kernel/git/pdx86/platform-drivers-x86.git/commit/drivers/platform/x86/hp/hp-wmi.c?h=for-next&id=c203c59fb5de1b1b8947d61176e868da1130cbeb)** *(Ensures safety/stability during manual operation)*

**My Contribution (The "Split" Patch):**
While the upstream driver provides a single control point, I added a specific patch layer to **separate CPU and GPU fan controls**, allowing for the independent regulation you see in this app.

**Note:** Since these patches are currently in the `for-next` branch, they are expected to land in official Linux Kernel versions soon (likely 7.0+). Until then, this DKMS module bridges the gap.

**Bonus Compatibility:**
By installing this driver, your device will expose standard `hwmon` interfaces for PWM control. This means your HP Victus will also become compatible with other advanced cooling tools such as **[CoolerControl](https://gitlab.com/coolercontrol/coolercontrol)**.

---

## Installation (v0.3.0)

Since v0.3.0 requires a kernel driver, the installation is a two-step process.

### Step 0: Install Dependencies
You need `dkms` and kernel headers to compile the driver.

* **Fedora:** `sudo dnf install dkms kernel-devel gcc make`
* **Ubuntu/Debian:** `sudo apt install dkms build-essential linux-headers-generic`
* **Arch:** `sudo pacman -S dkms linux-headers base-devel`

### Step 1: Install the Driver
1.  Download the release `.zip` file.
2.  Navigate to the `driver` folder inside.
3.  Run the installer:
    ```sh
    sudo ./install.sh
    ```

### Step 2: Install the Application
**For Fedora (RPM):**
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

To completely remove the application and the driver:

**Remove the App:**

```sh
# RPM Users
sudo dnf remove hp-fan-control

# Universal Installer Users
sudo ./uninstall.sh
```

**Remove the Driver:** Navigate to the driver folder and run:

```sh
sudo ./uninstall.sh
```

---

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


## ⚠️ Disclaimer

This software modifies hardware fan settings via a custom kernel module. The software is provided "as is". Running fans at maximum speed continuously or setting them too low during high loads may affect hardware lifespan. The developer cannot be held responsible for any hardware or software issues that may arise from use.

---

### 📄 License

This project is licensed under the [MIT License](https://github.com/kursatabayli/hp-fan-control/blob/main/LICENSE)
