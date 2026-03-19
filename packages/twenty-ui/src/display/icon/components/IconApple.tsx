import { useContext } from 'react';

import IconAppleRaw from '@assets/icons/apple.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconAppleProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconApple = (props: IconAppleProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconAppleRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
