using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using HpFanControl.Core.Models;

namespace HpFanControl.UI.Components;

public partial class CurveEditor : ComponentBase, IAsyncDisposable
{
  [Parameter] public List<FanCurvePoint> Points { get; set; } = new();
  [Parameter] public string Title { get; set; } = "Fan Curve";
  [Parameter] public string Color { get; set; } = "#00e5ff";
  [Parameter] public int CurrentTemp { get; set; } = 0;
  [Parameter] public EventCallback OnChanged { get; set; }

  [Inject] private IJSRuntime JS { get; set; } = default!;

  private ElementReference _containerRef;
  private ElementReference _svgRef;
  private DotNetObjectReference<CurveEditor>? _dotNetRef;

  private readonly string _guid = Guid.NewGuid().ToString("N");

  private double _width = 600;
  private const double Height = 250;
  private const double PaddingX = 20;

  private int? _draggingIndex = null;
  private int? _hoverIndex = null;

  private BoundingClientRect? _cachedSvgRect;

  private double StepX => Points.Count > 1 ? (_width - 2 * PaddingX) / (Points.Count - 1) : 0;

  private string _linePath => BuildPath(false);
  private string _areaPath => BuildPath(true);

  protected override async Task OnAfterRenderAsync(bool firstRender)
  {
    if (firstRender)
    {
      _dotNetRef = DotNetObjectReference.Create(this);

      await JS.InvokeVoidAsync("curveEditor.addResizeListener", _containerRef, _dotNetRef);

      var rect = await JS.InvokeAsync<BoundingClientRect>("curveEditor.getBoundingClientRect", _containerRef);
      if (rect != null && rect.Width > 0)
      {
        _width = rect.Width;
        StateHasChanged();
      }
    }
  }

  [JSInvokable]
  public void OnResize(double width)
  {
    if (_width != width)
    {
      _width = width;
      StateHasChanged();
    }
  }

  private async Task HandlePointerDown(PointerEventArgs e)
  {
    int count = Points.Count;
    double step = StepX;
    double halfStep = step / 2;

    for (int i = 0; i < count; i++)
    {
      if (Math.Abs(e.OffsetX - GetPointX(i)) < halfStep)
      {
        _draggingIndex = i;

        _cachedSvgRect = await JS.InvokeAsync<BoundingClientRect>("curveEditor.getBoundingClientRect", _svgRef);

        UpdateSpeed(i, e.OffsetY);

        break;
      }
    }
  }

  private async Task HandlePointerUp(PointerEventArgs e)
  {
    if (_draggingIndex.HasValue)
    {
      _draggingIndex = null;
      _cachedSvgRect = null;

      await OnChanged.InvokeAsync();
    }
  }

  private void HandlePointerMove(PointerEventArgs e)
  {
    if (_draggingIndex.HasValue)
    {
      double relativeY;

      if (_cachedSvgRect != null)
      {
        relativeY = e.ClientY - _cachedSvgRect.Top;
      }
      else
      {
        relativeY = e.OffsetY;
      }

      UpdateSpeed(_draggingIndex.Value, relativeY);
    }
  }

  private void UpdateSpeed(int index, double currentY)
  {
    int newPwm = YToPwm(currentY);

    if (Points[index].Speed != newPwm)
    {
      Points[index] = Points[index] with { Speed = newPwm };

    }
  }

  private double GetCurrentTempX()
  {
    if (Points.Count == 0) return -100;

    double minTemp = Points[0].Temperature;
    double maxTemp = Points[^1].Temperature;

    double clamped = Math.Clamp(CurrentTemp, minTemp, maxTemp);
    double range = maxTemp - minTemp;
    double normalized = range > 0 ? (clamped - minTemp) / range : 0;

    return PaddingX + (normalized * (_width - 2 * PaddingX));
  }

  private double GetPointX(int index) => PaddingX + index * StepX;

  private static double GetPwmY(int speed) => Height - (speed / 255.0) * Height;

  private static int YToPwm(double y) => Math.Clamp((int)Math.Round(((Height - y) / Height) * 255.0), 0, 255);

  private static int PwmToPercent(int pwm) => (int)Math.Round((pwm / 255.0) * 100);

  private static string Invariant(double value) => value.ToString(CultureInfo.InvariantCulture);

  private string BuildPath(bool isArea)
  {
    if (Points.Count == 0) return "";

    var sb = new StringBuilder(Points.Count * 25 + 50);

    for (int i = 0; i < Points.Count; i++)
    {
      sb.Append(i == 0 ? "M" : "L");

      sb.Append(' ');
      sb.Append(Invariant(GetPointX(i)));
      sb.Append(' ');
      sb.Append(Invariant(GetPwmY(Points[i].Speed)));
    }

    if (isArea)
    {
      sb.Append(" L ");
      sb.Append(Invariant(GetPointX(Points.Count - 1)));
      sb.Append(' ');
      sb.Append(Invariant(Height));

      sb.Append(" L ");
      sb.Append(Invariant(GetPointX(0)));
      sb.Append(' ');
      sb.Append(Invariant(Height));
      sb.Append(" Z");
    }

    return sb.ToString();
  }

  public async ValueTask DisposeAsync()
  {
    if (_dotNetRef != null)
    {
      _dotNetRef.Dispose();
      _dotNetRef = null;
    }

    try
    {
      await JS.InvokeVoidAsync("curveEditor.removeResizeListener", _containerRef);
    }
    catch
    {
    }
  }

  public class BoundingClientRect
  {
    public double Top { get; set; }
    public double Left { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
  }
}