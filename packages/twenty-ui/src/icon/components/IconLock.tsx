import IconLockRaw from '@assets/icons/lock.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconLockCustomProps = Pick<IconComponentProps, 'size'>;

export const IconLockCustom = (props: IconLockCustomProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconLockRaw height={size} width={size} />;
};
