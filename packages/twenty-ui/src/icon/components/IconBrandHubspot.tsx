import IconBrandHubspotRaw from '@assets/icons/hubspot.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconBrandHubspotProps = Pick<IconComponentProps, 'size'>;

export const IconBrandHubspot = (props: IconBrandHubspotProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconBrandHubspotRaw height={size} width={size} />;
};
