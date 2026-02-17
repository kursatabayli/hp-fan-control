using HpFanControl.Core.Models;

namespace HpFanControl.Core.Services.Interfaces;

public interface IConfigService
{
    FanConfig Load();

    void Save(FanConfig config);
}