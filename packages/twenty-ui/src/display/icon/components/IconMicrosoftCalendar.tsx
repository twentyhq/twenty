import IconMicrosoftCalendarRaw from '@assets/icons/microsoft-calendar.svg?react';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
interface IconMicrosoftCalendarProps {
  size?: number | string;
}

export const IconMicrosoftCalendar = (props: IconMicrosoftCalendarProps) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);

  return <IconMicrosoftCalendarRaw height={size} width={size} />;
};
