import { useTheme } from '@emotion/react';

import IconGoogleCalendarRaw from '@assets/icons/google-calendar.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleCalendarProps = IconComponentProps;

export const IconGoogleCalendar = ({ size }: IconGoogleCalendarProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;

  return <IconGoogleCalendarRaw height={iconSize} width={iconSize} />;
};
