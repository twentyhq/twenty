import { styled } from '@linaria/react';

import { theme } from '@ui/theme';

const StyledNotificationCounter = styled.div<{
  variant: 'primary' | 'secondary';
}>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.font.size.xxs};
  font-weight: ${theme.font.weight.semiBold};
  background: ${({ variant }) =>
    variant === 'primary'
      ? theme.color.blue
      : theme.background.transparent.light};
  color: ${({ variant }) =>
    variant === 'primary' ? 'white' : theme.font.color.secondary};
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
