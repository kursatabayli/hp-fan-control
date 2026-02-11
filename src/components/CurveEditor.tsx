import { useState, useRef, useEffect, useMemo } from "react";
import { CurvePoint } from "../types";

interface Props {
  title: string;
  points: CurvePoint[];
  color: string;
  currentTemp?: number;
  onChange: (newPoints: CurvePoint[]) => void;
}

const FIXED_TEMPS = [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

export const CurveEditor = ({ title, points, color, currentTemp = 0, onChange }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [width, setWidth] = useState(300);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const height = 250;
  const paddingX = 40;
  const paddingY = 30;

  const activePoints = useMemo(() => {
    return FIXED_TEMPS.map(t => {
      const existing = points.find(p => Math.abs(p.temp - t) < 3);
      return { temp: t, speed: existing ? existing.speed : 0 };
    });
  }, [points]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const stepX = (width - 2 * paddingX) / (FIXED_TEMPS.length - 1);

  const getPointX = (index: number) => paddingX + index * stepX;
  const getPwmY = (speed: number) => (height - paddingY) - (speed / 255) * (height - 2 * paddingY);

  const yToPwm = (y: number) => {
    const availableHeight = height - 2 * paddingY;
    const valueFromBottom = (height - paddingY) - y;
    const raw = (valueFromBottom / availableHeight) * 255;
    return Math.min(255, Math.max(0, Math.round(raw)));
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
    updateSpeed(index, e.clientY);
  };

  const updateSpeed = (index: number, clientY: number) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;

    const newSpeed = yToPwm(relativeY);

    const newPoints = [...activePoints];
    newPoints[index] = { ...newPoints[index], speed: newSpeed };
    onChange(newPoints);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingIndex !== null) {
      updateSpeed(draggingIndex, e.clientY);
    }
  };

  const handleMouseUp = () => setDraggingIndex(null);

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingIndex, activePoints]);

  const linePath = activePoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${getPointX(i)} ${getPwmY(p.speed)}`
  ).join(" ");

  const areaPath = `
    ${linePath}
    L ${getPointX(activePoints.length - 1)} ${height - paddingY}
    L ${getPointX(0)} ${height - paddingY}
    Z
  `;

  const getCurrentTempX = () => {
    const clamped = Math.max(45, Math.min(95, currentTemp));
    const normalized = (clamped - 45) / (95 - 45);

    const startX = getPointX(0);
    const endX = getPointX(activePoints.length - 1);
    return startX + normalized * (endX - startX);
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#09090b] border border-white/10 rounded-xl p-4 relative w-full select-none shadow-xl"
    >
      <div className="flex justify-between items-center mb-4 px-2 select-none">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }}></div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-widest uppercase">{title}</h3>
          </div>
        </div>
      </div>

      <div className="relative w-full h-62.5 cursor-default">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {Array.from({ length: FIXED_TEMPS.length }).map((_, i) => {
            const x = getPointX(i);
            return (
              <line
                key={`v-${i}`}
                x1={x} y1={paddingY}
                x2={x} y2={height - paddingY}
                stroke="white"
                strokeOpacity={i === 0 || i === FIXED_TEMPS.length - 1 ? 0.2 : 0.05}
                strokeWidth={1}
              />
            );
          })}

          {Array.from({ length: 11 }).map((_, i) => {
            const y = paddingY + i * ((height - 2 * paddingY) / 10);
            return (
              <line
                key={`h-${i}`} x1={paddingX} y1={y} x2={width - paddingX} y2={y}
                stroke="white" strokeOpacity={0.05} strokeWidth={1}
              />
            );
          })}

          <path d={areaPath} fill={`url(#grad-${title})`} />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />

          <line
            x1={getCurrentTempX()} y1={paddingY}
            x2={getCurrentTempX()} y2={height - paddingY}
            stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="2 2"
          />

          {activePoints.map((p, i) => {
            const x = getPointX(i);
            const y = getPwmY(p.speed);
            const isHovered = hoverIndex === i;
            const isDragging = draggingIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onMouseDown={(e) => handleMouseDown(i, e)}
                className="cursor-pointer group"
              >
                <rect
                  x={x - stepX / 2} y={paddingY}
                  width={stepX} height={height - 2 * paddingY}
                  fill="transparent"
                />

                <line
                  x1={x} y1={paddingY} x2={x} y2={height - paddingY}
                  stroke={color} strokeWidth="1"
                  opacity={isHovered || isDragging ? 0.3 : 0}
                  className="transition-opacity duration-200"
                />

                <rect
                  x={x - 5} y={y - 5} width={10} height={10}
                  fill="#09090b"
                  stroke={color}
                  strokeWidth="2"
                  transform={`rotate(45 ${x} ${y})`}
                  className={`transition-colors duration-100 ${isDragging ? 'fill-white' : 'group-hover:fill-white/20'}`}
                  style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                />

                <text
                  x={x} y={height - paddingY + 20}
                  fill="white" opacity={isHovered || isDragging ? 1 : 0.4}
                  fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold"
                  className="pointer-events-none transition-opacity"
                >
                  {p.temp}°
                </text>

                <g
                  transform={`translate(${x}, ${y - 25})`}
                  opacity={isHovered || isDragging ? 1 : 0}
                  className="transition-opacity pointer-events-none"
                >
                  <rect x="-16" y="-12" width="32" height="16" rx="3" fill="#18181b" stroke={color} strokeWidth="1" />
                  <text y="-2" fill="white" fontSize="9" textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">
                    {Math.round(p.speed / 255 * 100)}%
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        <div className="absolute top-0 left-0 h-full w-10 border-r border-white/5 flex flex-col justify-between py-7.5 text-[9px] text-white/20 font-mono text-right pr-2 select-none">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
      </div>
    </div>
  );
};