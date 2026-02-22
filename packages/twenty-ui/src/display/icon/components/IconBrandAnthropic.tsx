import { useTheme } from '@emotion/react';

import IconAnthropicRaw from '@assets/icons/anthropic.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconBrandAnthropicProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandAnthropic = (props: IconBrandAnthropicProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconAnthropicRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
