import IllustrationIconCalendarEventRaw from '@assets/icons/illustration-calendar-event.svg?react';
import { IllustrationIconWrapper } from '@ui/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IllustrationIconCalendarEventProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarEvent = (
  props: IllustrationIconCalendarEventProps,
) => {
  const theme = useTheme();
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
