import { useContext } from 'react';

import IconBrandMistralRaw from '@assets/icons/mistral.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IconBrandMistralProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandMistral = (props: IconBrandMistralProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconBrandMistralRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
