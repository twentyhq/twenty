import { useContext } from 'react';

import IconLockRaw from '@assets/icons/lock.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IconLockCustomProps = Pick<IconComponentProps, 'size'>;

export const IconLockCustom = (props: IconLockCustomProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconLockRaw height={size} width={size} />;
};
