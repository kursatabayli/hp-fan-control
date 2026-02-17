namespace HpFanControl.Core.Hardware.Interfaces;

public interface IGpuProvider : IDisposable
{
  string Name { get; }
  bool IsAvailable { get; }
  bool IsActive { get; }
  int GetTemperature();
  void Initialize();
}