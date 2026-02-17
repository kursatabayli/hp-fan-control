using HpFanControl.Core.Hardware.Interfaces;
using HpFanControl.Core.Helpers;
using Microsoft.Extensions.Logging;

namespace HpFanControl.Core.Hardware.Implementations;

public class IntegratedGpuProvider : IGpuProvider
{
  private readonly ILogger<IntegratedGpuProvider> _logger;
  private string? _tempPath;
  private FileStream? _stream;
  private readonly byte[] _buffer = new byte[16];

  private static readonly byte[][] Drivers = ["amdgpu"u8.ToArray(), "i915"u8.ToArray()];

  public string Name => "Integrated GPU";
  public bool IsAvailable => _tempPath != null;
  public bool IsActive => true;

  public IntegratedGpuProvider(ILogger<IntegratedGpuProvider> logger)
  {
    _logger = logger;
  }

  public void Initialize()
  {
    if (_tempPath != null) return;

    var baseDir = "/sys/class/hwmon";
    if (!Directory.Exists(baseDir)) return;

    Span<byte> nameBuffer = stackalloc byte[64];

    foreach (var dir in Directory.EnumerateDirectories(baseDir))
    {
      var potentialPath = Path.Combine(dir, "temp1_input");
      if (!File.Exists(potentialPath)) continue;

      var namePath = Path.Combine(dir, "name");

      try
      {
        using var fs = File.OpenRead(namePath);
        int bytesRead = fs.Read(nameBuffer);

        var content = SysFs.TrimSpan(nameBuffer.Slice(0, bytesRead));

        foreach (var driver in Drivers)
        {
          if (content.SequenceEqual(driver))
          {
            _tempPath = potentialPath;
            _logger.LogInformation("Integrated GPU Provider found: {Driver} at {Path}",
                System.Text.Encoding.UTF8.GetString(driver), _tempPath);
            return;
          }
        }
      }
      catch
      {
        continue;
      }
    }
  }

  public int GetTemperature()
  {
    if (_tempPath == null) return 0;

    return SysFs.ReadInt(ref _stream, _tempPath, _buffer) / 1000;
  }

  public void Dispose()
  {
    _stream?.Dispose();
  }
}