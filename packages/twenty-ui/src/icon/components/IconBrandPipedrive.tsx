import IconBrandPipedriveRaw from '@assets/icons/pipedrive.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconBrandPipedriveProps = Pick<IconComponentProps, 'size'>;

export const IconBrandPipedrive = (props: IconBrandPipedriveProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconBrandPipedriveRaw height={size} width={size} />;
};
