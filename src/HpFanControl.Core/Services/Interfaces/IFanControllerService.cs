using HpFanControl.Core.Models;

namespace HpFanControl.Core.Services.Interfaces;

public interface IFanControllerService
{
    FanMode CurrentMode { get; }
    event Action<SystemStats>? StatsUpdated;

    event Action<FanMode>? ModeChanged;

    void Start();

    void Stop();

    void LoadConfig(FanConfig config);

    void SetMode(FanMode mode);
}