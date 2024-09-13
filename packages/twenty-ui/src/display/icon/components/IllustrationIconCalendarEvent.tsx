import { useTheme } from '@emotion/react';

import styled from '@emotion/styled';
import IllustrationIconCalendarEventRaw from '@ui/display/icon/assets/illustration-calendar-event.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';
type IllustrationIconCalendarEventProps = Pick<IconComponentProps, 'size'>;

const StyledTestRect = styled('div')`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 0.75px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: center;
  size: auto;
`;

export const IllustrationIconCalendarEvent = (
  props: IllustrationIconCalendarEventProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <StyledTestRect>
      <IllustrationIconCalendarEventRaw
        fill={fill}
        color={color}
        height={size}
        width={size}
      />
    </StyledTestRect>
  );
};
