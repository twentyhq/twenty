import IconOpenaiRaw from '@assets/icons/openai.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconProviderOpenaiProps = Pick<IconComponentProps, 'size' | 'color'>;

export const IconProviderOpenai = (props: IconProviderOpenaiProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IconOpenaiRaw
      height={size}
      width={size}
      color={props.color ?? 'currentColor'}
    />
  );
};
