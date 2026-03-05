import { useContext } from 'react';

import IconBrandGroqRaw from '@assets/icons/groq.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconBrandGroqProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandGroq = (props: IconBrandGroqProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? parseFloat(theme.icon.size.lg);

  return (
    <IconBrandGroqRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
