import { styled } from '@linaria/react';

const StyledNotificationCounter = styled.div<{
  variant: 'primary' | 'secondary';
}>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xxs);
  font-weight: var(--font-weight-semi-bold);
  background: ${({ variant }) =>
    variant === 'primary'
      ? 'var(--color-blue)'
      : 'var(--background-transparent-light)'};
  color: ${({ variant }) =>
    variant === 'primary' ? 'white' : 'var(--font-color-secondary)'};
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
