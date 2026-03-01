import { styled } from '@linaria/react';

import { themeCssVariables } from '@ui/theme';

const StyledNotificationCounter = styled.div<{
  variant: 'primary' | 'secondary';
}>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${themeCssVariables.font.size.xxs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  background: ${({ variant }) =>
    variant === 'primary'
      ? themeCssVariables.color.blue
      : themeCssVariables.background.transparent.light};
  color: ${({ variant }) =>
    variant === 'primary' ? 'white' : themeCssVariables.font.color.secondary};
`;

type NotificationCounterProps = {
  count: number;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export const NotificationCounter = ({
  count,
  variant = 'primary',
  className,
}: NotificationCounterProps) => {
  return (
    <StyledNotificationCounter variant={variant} className={className}>
      {count}
    </StyledNotificationCounter>
  );
};
