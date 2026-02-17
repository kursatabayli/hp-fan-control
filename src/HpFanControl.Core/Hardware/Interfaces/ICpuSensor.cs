namespace HpFanControl.Core.Hardware.Interfaces;

public interface ICpuSensor : IDisposable
{
    int ReadTemperature();
}