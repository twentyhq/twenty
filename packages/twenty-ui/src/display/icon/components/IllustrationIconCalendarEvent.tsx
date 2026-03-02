import IllustrationIconCalendarEventRaw from '@assets/icons/illustration-calendar-event.svg?react';
import { useContext } from 'react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';
type IllustrationIconCalendarEventProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarEvent = (
  props: IllustrationIconCalendarEventProps,
) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarEventRaw
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
