import { useTheme } from '@emotion/react';

import IconIllustrationCalendarTimeRaw from '@ui/display/icon/assets/illustration-calendar-time.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationCalendarTimeProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationCalendarTime = (
  props: IconIllustrationCalendarTimeProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationCalendarTimeRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
