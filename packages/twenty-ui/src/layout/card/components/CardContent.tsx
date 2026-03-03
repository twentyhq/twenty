import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';
import { motion } from 'framer-motion';
import { type ComponentProps, type ReactNode } from 'react';

const StyledCardContentBase = styled.div<{
  divider?: boolean;
}>`
  background-color: ${themeCssVariables.background.secondary};
  padding: ${themeCssVariables.spacing[4]};

  border-bottom: ${({ divider }) =>
    divider ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};

  &[data-clickable='true'] {
    cursor: pointer;
  }
`;

const MotionCardContent = motion.create(StyledCardContentBase);

type CardContentProps = {
  children?: ReactNode;
  className?: string;
  divider?: boolean;
  isClickable?: boolean;
} & Omit<ComponentProps<typeof MotionCardContent>, 'theme'>;

export const CardContent = ({
  children,
  className,
  divider,
  isClickable,
  ...rest
}: CardContentProps) => {
  return (
    <MotionCardContent
      className={className}
      divider={divider}
      data-clickable={isClickable}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </MotionCardContent>
  );
};
