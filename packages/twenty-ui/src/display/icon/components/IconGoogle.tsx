import { useTheme } from '@emotion/react';

import IconGoogleRaw from '@assets/icons/google.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleProps = IconComponentProps;

export const IconGoogle = ({ size }: IconGoogleProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return <IconGoogleRaw height={iconSize} width={iconSize} />;
};
