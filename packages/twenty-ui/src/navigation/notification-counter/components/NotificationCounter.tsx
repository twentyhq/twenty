import { styled } from '@linaria/react';

import { themeVar } from '@ui/theme';

const StyledNotificationCounter = styled.div<{
  variant: 'primary' | 'secondary';
}>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${themeVar.font.size.xxs};
  font-weight: ${themeVar.font.weight.semiBold};
  background: ${({ variant }) =>
    variant === 'primary'
      ? themeVar.color.blue
      : themeVar.background.transparent.light};
  color: ${({ variant }) =>
    variant === 'primary' ? 'white' : themeVar.font.color.secondary};
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
