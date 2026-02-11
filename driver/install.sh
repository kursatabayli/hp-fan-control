#!/bin/bash

# Root check
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo)."
  exit
fi

echo "Adding driver to DKMS..."

# Copy files to /usr/src
mkdir -p /usr/src/hp-wmi-dkms-0.3.0
cp -r ./* /usr/src/hp-wmi-dkms-0.3.0/

# Add, build, and install with DKMS
dkms add -m hp-wmi-dkms -v 0.3.0
dkms build -m hp-wmi-dkms -v 0.3.0
dkms install -m hp-wmi-dkms -v 0.3.0

# Reload the module
modprobe -r hp-wmi
modprobe hp-wmi

echo "Installation complete! Driver is active."