import { useTheme } from '@emotion/react';

import IconBrandGroqRaw from '@assets/icons/groq.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconBrandGroqProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandGroq = (props: IconBrandGroqProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconBrandGroqRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
