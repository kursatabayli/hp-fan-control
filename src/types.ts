export interface SystemStats {
  cpuTemp: number;
  gpuTemp: number;
  cpuFanRpm: number;
  gpuFanRpm: number;
}

export interface CurvePoint {
  temp: number;
  speed: number;
}

export interface FanConfig {
  cpuCurve: CurvePoint[];
  gpuCurve: CurvePoint[];
  lastMode: string;
}

export const DEFAULT_CURVE_POINTS: CurvePoint[] = [
  { temp: 45, speed: 76 },
  { temp: 50, speed: 89 },
  { temp: 55, speed: 102 },
  { temp: 60, speed: 115 },
  { temp: 65, speed: 128 },
  { temp: 70, speed: 153 },
  { temp: 75, speed: 179 },
  { temp: 80, speed: 204 },
  { temp: 85, speed: 230 },
  { temp: 90, speed: 255 },
  { temp: 95, speed: 255 },
];
