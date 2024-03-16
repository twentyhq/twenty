import { useTheme } from '@emotion/react';

import IconGoogleCalendarRaw from '../assets/google-calendar.svg?react';

type IconGoogleCalendarProps = {
  size?: number;
};

export const IconGoogleCalendar = (props: IconGoogleCalendarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleCalendarRaw height={size} width={size} />;
};
