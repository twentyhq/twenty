import styled from '@emotion/styled';

const StyledNotificationCounter = styled.div<{
  variant: 'primary' | 'secondary';
}>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.xxs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  background: ${({ theme, variant }) =>
    variant === 'primary'
      ? theme.color.blue
      : theme.background.transparent.light};
  color: ${({ theme, variant }) =>
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
