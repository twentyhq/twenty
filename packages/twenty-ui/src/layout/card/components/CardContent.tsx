import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme';
import { motion } from 'framer-motion';
import { type ComponentProps, type ReactNode } from 'react';

const StyledCardContentBase = styled.div<{
  divider?: boolean;
}>`
  background-color: ${themeCssVariables.background.secondary};
  padding: ${themeCssVariables.spacing[4]};

  border-bottom: ${({ divider }) =>
    divider ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};
`;

const MotionCardContent = motion.create(StyledCardContentBase);

type CardContentProps = {
  children?: ReactNode;
  className?: string;
  divider?: boolean;
} & Omit<ComponentProps<typeof MotionCardContent>, 'theme'>;

export const CardContent = ({
  children,
  className,
  divider,
  ...rest
}: CardContentProps) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <MotionCardContent className={className} divider={divider} {...rest}>
      {children}
    </MotionCardContent>
  );
};
