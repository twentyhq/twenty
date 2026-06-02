import { IconHierarchy3 } from '@tabler/icons-react';

type WorkflowIconProps = { size: number; color: string; strokeWidth?: number };

export function WorkflowIcon({
  size,
  color,
  strokeWidth = 2,
}: WorkflowIconProps) {
  return <IconHierarchy3 size={size} color={color} stroke={strokeWidth} />;
}
