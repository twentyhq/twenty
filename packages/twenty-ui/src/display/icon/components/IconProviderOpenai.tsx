import { useContext } from 'react';

import IconOpenaiRaw from '@assets/icons/openai.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconProviderOpenaiProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconProviderOpenai = (props: IconProviderOpenaiProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconOpenaiRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
