using HpFanControl.Core.Models;
using MudBlazor;

namespace HpFanControl.UI.Models;

public record ModeUiDefinition(FanMode Id, string Label, string Icon, Color ThemeColor);