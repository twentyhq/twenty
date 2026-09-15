import IconMicrosoftCalendarRaw from '@assets/icons/microsoft-calendar.svg?react';
import { useTheme } from '@ui/theme-constants';

interface IconMicrosoftCalendarProps {
  size?: number | string;
}

export const IconMicrosoftCalendar = (props: IconMicrosoftCalendarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconMicrosoftCalendarRaw height={size} width={size} />;
};
