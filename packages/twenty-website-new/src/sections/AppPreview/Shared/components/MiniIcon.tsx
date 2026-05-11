import type { ComponentType } from 'react';

type MiniIconProps = {
  color?: string;
  icon: ComponentType<{
    'aria-hidden'?: boolean;
    color?: string;
    size?: number;
    stroke?: number;
  }>;
  size?: number;
  stroke?: number;
};

export function MiniIcon({
  color,
  icon: Icon,
  size = 14,
  stroke = 1.6,
}: MiniIconProps) {
  return <Icon aria-hidden color={color} size={size} stroke={stroke} />;
}
