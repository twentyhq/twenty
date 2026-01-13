import IllustrationIconCalendarTimeRaw from '@assets/icons/illustration-calendar-time.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCalendarTimeProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconCalendarTime = (
  props: IllustrationIconCalendarTimeProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarTimeRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
