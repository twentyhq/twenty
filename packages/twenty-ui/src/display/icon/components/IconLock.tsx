import { useTheme } from '@emotion/react';

import IconLockRaw from '@assets/icons/lock.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

export const IconLockCustom = ({ size }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return <IconLockRaw height={iconSize} width={iconSize} />;
};
