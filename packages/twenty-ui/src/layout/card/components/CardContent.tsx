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
  ...motionProps
}: CardContentProps) => {
  return (
    <MotionCardContent
      className={className}
      divider={divider}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...motionProps}
    >
      {children}
    </MotionCardContent>
  );
};
