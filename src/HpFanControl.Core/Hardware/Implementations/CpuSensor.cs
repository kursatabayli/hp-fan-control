using Microsoft.Extensions.Logging;
using HpFanControl.Core.Hardware.Interfaces;
using HpFanControl.Core.Helpers;

namespace HpFanControl.Core.Hardware.Implementations;

public class CpuSensor : ICpuSensor
{
    private readonly ILogger<CpuSensor> _logger;

    private static readonly byte[][] PriorityDrivers =
    [
        "k10temp"u8.ToArray(),
        "coretemp"u8.ToArray(),
        "acpitz"u8.ToArray()
    ];

    private string? _detectedPath;
    private FileStream? _stream;

    private readonly byte[] _tempBuffer = new byte[16];

    public CpuSensor(ILogger<CpuSensor> logger)
    {
        _logger = logger;
    }

    public int ReadTemperature()
    {
        if (_detectedPath == null)
        {
            FindPath();
            if (_detectedPath == null) return 0;
        }

        return SysFs.ReadInt(ref _stream, _detectedPath!, _tempBuffer) / 1000;
    }

    public void FindPath()
    {
        var baseDir = "/sys/class/hwmon";
        if (!Directory.Exists(baseDir))
        {
            _logger.LogWarning("Hwmon directory not found.");
            return;
        }

        try
        {
            var directories = Directory.GetDirectories(baseDir);

            foreach (var targetDriver in PriorityDrivers)
            {
                foreach (var dir in directories)
                {
                    var namePath = Path.Combine(dir, "name");

                    FileStream? fs = null;
                    bool match = false;
                    try
                    {
                        match = SysFs.CheckContentEquals(ref fs, namePath, targetDriver, _tempBuffer);
                    }
                    finally
                    {
                        fs?.Dispose();
                    }

                    if (match)
                    {
                        var potentialPath = Path.Combine(dir, "temp1_input");

                        if (File.Exists(potentialPath))
                        {
                            _detectedPath = potentialPath;
                            _logger.LogInformation("CPU Sensor detected: {Driver} at {Path}",
                                System.Text.Encoding.UTF8.GetString(targetDriver), _detectedPath);

                            _stream?.Dispose();
                            _stream = null;

                            return;
                        }
                    }
                }
            }

            _logger.LogWarning("No compatible CPU thermal sensor found.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while scanning for CPU sensor.");
        }
    }

    public void Dispose()
    {
        _stream?.Dispose();
        _stream = null;
    }
}