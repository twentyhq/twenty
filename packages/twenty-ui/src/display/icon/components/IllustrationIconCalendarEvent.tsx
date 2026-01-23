import IllustrationIconCalendarEventRaw from '@assets/icons/illustration-calendar-event.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';


export const IllustrationIconCalendarEvent = ({
  size,
}: IconComponentProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconCalendarEventRaw
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
        height={iconSize}
        width={iconSize}
      />
    </IllustrationIconWrapper>
  );
};
