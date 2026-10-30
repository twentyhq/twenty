import IconLinkedinRaw from '@assets/icons/linkedin.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconLinkedinProps = Pick<IconComponentProps, 'size'>;

export const IconLinkedin = (props: IconLinkedinProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconLinkedinRaw height={size} width={size} />;
};
