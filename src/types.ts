export interface FanSensor {
  id: string;
  rpm: number;
}

export interface SystemStats {
  fans: FanSensor[];
}
