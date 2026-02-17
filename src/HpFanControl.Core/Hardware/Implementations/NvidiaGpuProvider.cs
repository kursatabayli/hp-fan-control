using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using HpFanControl.Core.Hardware.Interfaces;
using HpFanControl.Core.Helpers;

namespace HpFanControl.Core.Hardware.Implementations;

public partial class NvidiaGpuProvider : IGpuProvider
{
  private readonly ILogger<NvidiaGpuProvider> _logger;

  private const string LibName = "libnvidia-ml.so.1";
  private static readonly byte[] StatusActive = "active"u8.ToArray();
  private static readonly byte[] VendorNvidia = "0x10de"u8.ToArray();

  private string? _statusPath;
  private bool? _isNvmlAvailable;
  private IntPtr _nvmlDeviceHandle = IntPtr.Zero;

  private FileStream? _streamStatus;
  private readonly byte[] _buffer = new byte[64];

  public string Name => "Nvidia Discrete GPU";
  public bool IsAvailable => _statusPath != null;

  public bool IsActive
  {
    get
    {
      if (_statusPath == null) return false;
      return SysFs.CheckContentEquals(ref _streamStatus, _statusPath, StatusActive, _buffer);
    }
  }

  public NvidiaGpuProvider(ILogger<NvidiaGpuProvider> logger)
  {
    _logger = logger;
  }

  public void Initialize()
  {
    if (_statusPath != null) return;

    const string pciRoot = "/sys/bus/pci/devices";
    if (!Directory.Exists(pciRoot)) return;

    foreach (var dir in Directory.EnumerateDirectories(pciRoot))
    {
      var vPath = Path.Combine(dir, "vendor");
      FileStream? fs = null;
      try
      {
        if (SysFs.CheckContentEquals(ref fs, vPath, VendorNvidia, _buffer))
        {
          _statusPath = Path.Combine(dir, "power/runtime_status");
          _logger.LogInformation("Nvidia Hardware found. PM Path: {Path}", _statusPath);
          break;
        }
      }
      finally { fs?.Dispose(); }
    }
  }

  public int GetTemperature()
  {
    if (!IsAvailable || !IsActive) return 0;

    return ReadNvmlTemp();
  }

  private int ReadNvmlTemp()
  {
    if (_isNvmlAvailable == false) return 0;

    try
    {
      if (_isNvmlAvailable == null)
      {
        int initResult = NvmlNative.nvmlInit();
        if (initResult == 0)
        {
          _isNvmlAvailable = true;
          NvmlNative.nvmlDeviceGetHandleByIndex(0, out _nvmlDeviceHandle);
          _logger.LogInformation("NVML Library Initialized.");
        }
        else
        {
          _logger.LogWarning("NVML Init failed. Code: {Code}", initResult);
          _isNvmlAvailable = false;
          return 0;
        }
      }

      uint temp = 0;
      if (NvmlNative.nvmlDeviceGetTemperature(_nvmlDeviceHandle, 0, ref temp) == 0)
      {
        return (int)temp;
      }
    }
    catch (DllNotFoundException)
    {
      _logger.LogWarning("Nvidia drivers not installed (libnvidia-ml.so.1 missing).");
      _isNvmlAvailable = false;
    }
    catch (Exception ex)
    {
      _logger.LogDebug(ex, "Failed to read Nvidia temp.");
    }

    return 0;
  }

  public void Dispose()
  {
    _streamStatus?.Dispose();

    if (_isNvmlAvailable == true)
    {
      try { NvmlNative.nvmlShutdown(); } catch { }
    }
  }

  private static partial class NvmlNative
  {
    [LibraryImport(LibName)] public static partial int nvmlInit();
    [LibraryImport(LibName)] public static partial int nvmlShutdown();
    [LibraryImport(LibName)] public static partial int nvmlDeviceGetHandleByIndex(uint index, out IntPtr device);
    [LibraryImport(LibName)] public static partial int nvmlDeviceGetTemperature(IntPtr device, int sensorType, ref uint temp);
  }
}