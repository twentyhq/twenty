import { useTheme } from '@emotion/react';
import IllustrationIconCalendarTimeRaw from '@ui/display/icon/assets/illustration-calendar-time.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCalendarTimeProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarTime = (
  props: IllustrationIconCalendarTimeProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarTimeRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
