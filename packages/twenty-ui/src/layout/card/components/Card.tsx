import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';
import { type ComponentPropsWithoutRef } from 'react';

const StyledCard = styled.div<{
  fullWidth?: boolean;
  rounded?: boolean;
  backgroundColor?: string;
}>`
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? 'transparent'};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${({ rounded }) =>
    rounded
      ? themeCssVariables.border.radius.md
      : themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

type CardProps = ComponentPropsWithoutRef<'div'> & {
  fullWidth?: boolean;
  rounded?: boolean;
  backgroundColor?: string;
};

export const Card = ({
  children,
  className,
  fullWidth,
  rounded,
  backgroundColor,
  ...rest
}: CardProps) => {
  return (
    <StyledCard
      className={className}
      fullWidth={fullWidth}
      rounded={rounded}
      backgroundColor={backgroundColor}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </StyledCard>
  );
};
