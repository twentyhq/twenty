import { IconChartBar } from '@tabler/icons-react';

type ChartIconProps = { size: number; color: string; strokeWidth?: number };

export function ChartIcon({ size, color, strokeWidth = 2 }: ChartIconProps) {
  return <IconChartBar size={size} color={color} stroke={strokeWidth} />;
}
