using Microsoft.Extensions.Logging;
using HpFanControl.Core.Hardware.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace HpFanControl.Core.Hardware.Implementations;

public class GpuSensor : IGpuSensor
{
    private readonly ILogger<GpuSensor> _logger;
    private readonly IGpuProvider _nvidiaProvider;
    private readonly IGpuProvider _integratedProvider;

    public GpuSensor(
            ILogger<GpuSensor> logger,
            [FromKeyedServices("Discrete")] IGpuProvider nvidiaProvider,
            [FromKeyedServices("Integrated")] IGpuProvider integratedProvider)
    {
        _logger = logger;
        _nvidiaProvider = nvidiaProvider;
        _integratedProvider = integratedProvider;

        InitializeProviders();
    }

    private void InitializeProviders()
    {
        try
        {
            _nvidiaProvider.Initialize();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Nvidia Provider");
        }

        try
        {
            _integratedProvider.Initialize();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Integrated Provider");
        }
    }

    public int ReadTemperature()
    {
        if (_nvidiaProvider.IsAvailable && _nvidiaProvider.IsActive)
        {
            int nvTemp = _nvidiaProvider.GetTemperature();
            if (nvTemp > 0) return nvTemp;
        }

        return _integratedProvider.GetTemperature();
    }
}