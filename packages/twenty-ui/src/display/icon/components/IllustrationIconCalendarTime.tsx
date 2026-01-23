import IllustrationIconCalendarTimeRaw from '@assets/icons/illustration-calendar-time.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconCalendarTimeProps = IconComponentProps;

export const IllustrationIconCalendarTime = ({
  size,
}: IllustrationIconCalendarTimeProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarTimeRaw
        height={iconSize}
        width={iconSize}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
