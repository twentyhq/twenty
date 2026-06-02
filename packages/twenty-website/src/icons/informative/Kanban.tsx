import { IconLayoutKanban } from '@tabler/icons-react';

type KanbanIconProps = { size: number; color: string; strokeWidth?: number };

export function KanbanIcon({ size, color, strokeWidth = 2 }: KanbanIconProps) {
  return <IconLayoutKanban size={size} color={color} stroke={strokeWidth} />;
}
