using HpFanControl.Core.Models;

namespace HpFanControl.Core.Hardware.Interfaces;

public interface IFanDriver : IDisposable
{
    (int CpuRpm, int GpuRpm) GetRpms();

    void SetMode(FanMode mode);

    void SetSpeed(bool isGpu, int pwm);
}