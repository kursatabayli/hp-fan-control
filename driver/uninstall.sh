#!/bin/bash

# Root check
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo)."
  exit
fi

echo "Removing driver from system..."

# 1. Unload the module (Stop it)
if lsmod | grep -q "hp_wmi"; then
    modprobe -r hp-wmi
    echo "Module unloaded."
fi

# 2. Remove from DKMS
echo "Removing from DKMS..."
dkms remove -m hp-wmi-dkms -v 0.3.0 --all

# 3. Clean up source files
echo "Removing source files..."
rm -rf /usr/src/hp-wmi-dkms-0.3.0

echo "Driver uninstalled successfully."