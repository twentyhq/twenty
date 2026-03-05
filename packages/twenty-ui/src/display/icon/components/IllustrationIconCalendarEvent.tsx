import IllustrationIconCalendarEventRaw from '@assets/icons/illustration-calendar-event.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

type IllustrationIconCalendarEventProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarEvent = (
  props: IllustrationIconCalendarEventProps,
) => {
  const size =
    props.size ?? resolveThemeVariableAsNumber(themeCssVariables.icon.size.lg);
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarEventRaw
        fill={resolveThemeVariable(themeCssVariables.accent.accent3)}
        color={resolveThemeVariable(themeCssVariables.accent.accent8)}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
