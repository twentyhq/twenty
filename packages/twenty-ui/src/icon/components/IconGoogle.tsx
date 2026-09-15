import IconGoogleRaw from '@assets/icons/google.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconGoogleProps = Pick<IconComponentProps, 'size'>;

export const IconGoogle = (props: IconGoogleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleRaw height={size} width={size} />;
};
