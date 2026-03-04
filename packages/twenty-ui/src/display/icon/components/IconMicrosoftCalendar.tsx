import { useContext } from 'react';

import IconMicrosoftCalendarRaw from '@assets/icons/microsoft-calendar.svg?react';
import { ThemeContext } from '@ui/theme';

interface IconMicrosoftCalendarProps {
  size?: number | string;
}

export const IconMicrosoftCalendar = (props: IconMicrosoftCalendarProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftCalendarRaw height={size} width={size} />;
};
