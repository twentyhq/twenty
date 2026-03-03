import { useContext } from 'react';

import IconBrandXaiRaw from '@assets/icons/xai.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IconBrandXaiProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandXai = (props: IconBrandXaiProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconBrandXaiRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
