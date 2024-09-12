import { useTheme } from '@emotion/react';

import IllustrationIconCalendarTimeRaw from '@ui/display/icon/assets/illustration-calendar-time.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCalendarTimeProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarTime = (
  props: IllustrationIconCalendarTimeProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconCalendarTimeRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
