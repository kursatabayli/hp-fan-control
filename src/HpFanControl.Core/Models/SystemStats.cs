namespace HpFanControl.Core.Models;

public readonly record struct SystemStats(
    int CpuTemp,
    int GpuTemp,
    int CpuFanRpm,
    int GpuFanRpm
);