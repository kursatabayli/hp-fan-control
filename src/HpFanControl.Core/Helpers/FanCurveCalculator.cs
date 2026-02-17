using HpFanControl.Core.Models;

namespace HpFanControl.Core.Helpers;

public static class FanCurveCalculator
{
    public static int CalculatePwm(int currentTemp, ReadOnlySpan<FanCurvePoint> curve)
    {
        if (curve.IsEmpty) return 128;

        ref readonly var firstPoint = ref curve[0];
        if (currentTemp <= firstPoint.Temperature) return firstPoint.Speed;

        ref readonly var lastPoint = ref curve[^1];
        if (currentTemp >= lastPoint.Temperature) return lastPoint.Speed;

        for (int i = 0; i < curve.Length - 1; i++)
        {
            ref readonly var p1 = ref curve[i];
            ref readonly var p2 = ref curve[i + 1];

            if (currentTemp > p2.Temperature) continue;

            int tempRange = p2.Temperature - p1.Temperature;
            if (tempRange == 0) return p1.Speed;

            int tempDelta = currentTemp - p1.Temperature;
            int speedRange = p2.Speed - p1.Speed;

            int interpolatedSpeed = p1.Speed + (tempDelta * speedRange / tempRange);

            return interpolatedSpeed;
        }

        return 255;
    }
}