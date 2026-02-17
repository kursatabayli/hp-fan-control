using HpFanControl.Core.Models;

namespace HpFanControl.Core.Services.Interfaces;

public interface IHardwareService
{
    SystemStats GetSystemStats();

    void SetFanMode(FanMode mode);

    void SetFanSpeed(bool isGpu, int pwmValue);
    
    void ForceResetFanMode();
}