import { useTheme } from '@emotion/react';
import IllustrationIconCalendarEventRaw from '@ui/display/icon/assets/illustration-calendar-event.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';
type IllustrationIconCalendarEventProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarEvent = (
  props: IllustrationIconCalendarEventProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarEventRaw
        fill={fill.blue}
        color={color.blue}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
