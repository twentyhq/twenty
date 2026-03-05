import { useContext } from 'react';

import IconGoogleCalendarRaw from '@assets/icons/google-calendar.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IconGoogleCalendarProps = Pick<IconComponentProps, 'size'>;

export const IconGoogleCalendar = (props: IconGoogleCalendarProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? parseFloat(theme.icon.size.lg);

  return <IconGoogleCalendarRaw height={size} width={size} />;
};
