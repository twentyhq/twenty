import { useTheme } from '@emotion/react';

import IconLockRaw from '@ui/display/icon/assets/lock.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconLockCustomProps = Pick<IconComponentProps, 'size'>;

export const IconLockCustom = (props: IconLockCustomProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconLockRaw height={size} width={size} />;
};
