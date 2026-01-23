import { useTheme } from '@emotion/react';

import IconLockRaw from '@assets/icons/lock.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconLockCustomProps = IconComponentProps;

export const IconLockCustom = ({ size }: IconLockCustomProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return <IconLockRaw height={iconSize} width={iconSize} />;
};
