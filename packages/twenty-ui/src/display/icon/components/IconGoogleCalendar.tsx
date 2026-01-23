import { useTheme } from '@emotion/react';

import IconGoogleCalendarRaw from '@assets/icons/google-calendar.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

export const IconGoogleCalendar = ({ size }: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return <IconGoogleCalendarRaw height={iconSize} width={iconSize} />;
};
