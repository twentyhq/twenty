import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { type ComponentPropsWithoutRef } from 'react';

const StyledCard = styled.div<{
  fullWidth?: boolean;
  rounded?: boolean;
}>`
  border: 1px solid ${theme.border.color.medium};
  border-radius: ${({ rounded }) =>
    rounded ? theme.border.radius.md : theme.border.radius.sm};
  color: ${theme.font.color.secondary};
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

type CardProps = ComponentPropsWithoutRef<'div'> & {
  fullWidth?: boolean;
  rounded?: boolean;
};

export const Card = ({
  children,
  className,
  fullWidth,
  rounded,
  ...rest
}: CardProps) => {
  return (
    <StyledCard
      className={className}
      fullWidth={fullWidth}
      rounded={rounded}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </StyledCard>
  );
};
