import { useTheme } from '@emotion/react';

import IconGmailRaw from '@assets/icons/gmail.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

export const IconGmail = ({ size }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return <IconGmailRaw height={iconSize} width={iconSize} />;
};
