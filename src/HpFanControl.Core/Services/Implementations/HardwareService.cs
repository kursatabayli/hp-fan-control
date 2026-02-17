using Microsoft.Extensions.Logging;
using HpFanControl.Core.Hardware.Interfaces;
using HpFanControl.Core.Models;
using HpFanControl.Core.Services.Interfaces;

namespace HpFanControl.Core.Services.Implementations;

public class HardwareService : IHardwareService
{
    private readonly ILogger<HardwareService> _logger;
    private readonly ICpuSensor _cpuSensor;
    private readonly IGpuSensor _gpuSensor;
    private readonly IFanDriver _fanDriver;

    public HardwareService(
        ILogger<HardwareService> logger,
        ICpuSensor cpuSensor,
        IGpuSensor gpuSensor,
        IFanDriver fanDriver)
    {
        _logger = logger;
        _cpuSensor = cpuSensor;
        _gpuSensor = gpuSensor;
        _fanDriver = fanDriver;
    }

    public SystemStats GetSystemStats()
    {
        int cpuTemp = _cpuSensor.ReadTemperature();
        int gpuTemp = _gpuSensor.ReadTemperature();

        var (cpuRpm, gpuRpm) = _fanDriver.GetRpms();

        return new SystemStats(cpuTemp, gpuTemp, cpuRpm, gpuRpm);
    }

    public void SetFanMode(FanMode mode)
    {
        _fanDriver.SetMode(mode);
        _logger.LogInformation("Fan mode set to: {Mode}", mode);
    }

    public void SetFanSpeed(bool isGpu, int pwmValue)
    {
        _fanDriver.SetSpeed(isGpu, pwmValue);
    }

    public void ForceResetFanMode()
    {
        try
        {
            _fanDriver.SetMode(FanMode.Auto);
            _logger.LogInformation("Fan mode forced to Auto (Reset).");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to force reset fan mode.");
        }
    }
}