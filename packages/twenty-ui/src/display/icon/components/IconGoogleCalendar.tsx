import { useTheme } from '@emotion/react';

import IconGoogleCalendarRaw from '@ui/display/icon/assets/google-calendar.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconGoogleCalendarProps = Pick<IconComponentProps, 'size'>;

export const IconGoogleCalendar = (props: IconGoogleCalendarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleCalendarRaw height={size} width={size} />;
};
