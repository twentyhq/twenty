import { type ComponentType } from 'react';

import { THEME_LIGHT } from 'twenty-ui/theme';

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
  size = THEME_LIGHT.icon.size.sm,
  stroke = THEME_LIGHT.icon.stroke.sm,
}: MiniIconProps) {
  return <Icon aria-hidden color={color} size={size} stroke={stroke} />;
}
