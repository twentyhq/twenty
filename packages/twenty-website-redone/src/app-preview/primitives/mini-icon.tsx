import { type ComponentType } from 'react';

import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

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
  size = APP_PREVIEW_THEME.icon.size.sm,
  stroke = APP_PREVIEW_THEME.icon.stroke.sm,
}: MiniIconProps) {
  return <Icon aria-hidden color={color} size={size} stroke={stroke} />;
}
