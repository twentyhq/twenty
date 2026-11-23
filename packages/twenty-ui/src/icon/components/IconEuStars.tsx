import IconEuStarsRaw from '@assets/icons/eu-stars.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconEuStarsProps = Pick<IconComponentProps, 'size'>;

export const IconEuStars = (props: IconEuStarsProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconEuStarsRaw height={size} width={size} />;
};
