import { IconChecklist } from '@tabler/icons-react';

type ChecklistIconProps = { size: number; color: string; strokeWidth?: number };

export function ChecklistIcon({
  size,
  color,
  strokeWidth = 2,
}: ChecklistIconProps) {
  return <IconChecklist size={size} color={color} stroke={strokeWidth} />;
}
