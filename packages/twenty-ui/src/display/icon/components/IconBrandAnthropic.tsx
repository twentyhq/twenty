import { useContext } from 'react';

import IconAnthropicRaw from '@assets/icons/anthropic.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IconBrandAnthropicProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandAnthropic = (props: IconBrandAnthropicProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconAnthropicRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
