import IconBrandXaiRaw from '@assets/icons/xai.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconBrandXaiProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconBrandXai = (props: IconBrandXaiProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconBrandXaiRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
