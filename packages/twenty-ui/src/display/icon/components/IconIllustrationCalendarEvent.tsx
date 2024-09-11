import { useTheme } from '@emotion/react';

import IconIllustrationCalendarEventRaw from '@ui/display/icon/assets/illustration-calendar-event.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationCalendarEventProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationCalendarEvent = (
  props: IconIllustrationCalendarEventProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationCalendarEventRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
