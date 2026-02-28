import { styled } from '@linaria/react';
import { theme } from '@ui/theme';
import { motion } from 'framer-motion';
import { type ComponentProps, type ReactNode } from 'react';

const StyledCardContentBase = styled.div<{
  divider?: boolean;
}>`
  background-color: ${theme.background.secondary};
  padding: ${theme.spacing[4]};

  border-bottom: ${({ divider }) =>
    divider ? `1px solid ${theme.border.color.medium}` : 'none'};
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
