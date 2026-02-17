namespace HpFanControl.Core.Models;

public class FanConfig
{
    public List<FanCurvePoint> CpuCurve { get; set; } = [];
    public List<FanCurvePoint> GpuCurve { get; set; } = [];
    public FanMode LastMode { get; set; } = FanMode.Auto;

    public static FanConfig Default => new()
    {
        LastMode = FanMode.Auto,
        CpuCurve = CreateDefaultCurve(),
        GpuCurve = CreateDefaultCurve()
    };

    private static List<FanCurvePoint> CreateDefaultCurve()
    {
        return
        [
            new (45, 76),
            new (50, 89),
            new (55, 102),
            new (60, 115),
            new (65, 128),
            new (70, 153),
            new (75, 179),
            new (80, 204),
            new (85, 230),
            new (90, 255),
            new (95, 255)

        ];
    }
}