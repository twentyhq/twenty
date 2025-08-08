import { useTheme } from '@emotion/react';

import IconGoogleCalendarRaw from '@assets/icons/google-calendar.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleCalendarProps = Pick<IconComponentProps, 'size'>;

export const IconGoogleCalendar = (props: IconGoogleCalendarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleCalendarRaw height={size} width={size} />;
};
