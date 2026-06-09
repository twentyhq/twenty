import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';
import { motion } from 'framer-motion';
import { type ComponentProps, type ReactNode } from 'react';

const StyledCardContentBase = styled.div<{
  divider?: boolean;
  isClickable?: boolean;
  hasHoverHighlight?: boolean;
}>`
  background-color: ${themeCssVariables.background.secondary};
  padding: ${themeCssVariables.spacing[4]};

  border-bottom: ${({ divider }) =>
    divider ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};

  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};

  &:hover {
    background: ${({ hasHoverHighlight }) =>
      hasHoverHighlight
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }
`;

const MotionCardContent = motion.create(StyledCardContentBase);

type CardContentProps = {
  children?: ReactNode;
  className?: string;
  divider?: boolean;
  isClickable?: boolean;
  hasHoverHighlight?: boolean;
} & Omit<ComponentProps<typeof MotionCardContent>, 'theme'>;

export const CardContent = ({
  children,
  className,
  divider,
  isClickable,
  hasHoverHighlight,
  ...rest
}: CardContentProps) => {
  return (
    <MotionCardContent
      className={className}
      divider={divider}
      isClickable={isClickable}
      hasHoverHighlight={hasHoverHighlight}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </MotionCardContent>
  );
};
