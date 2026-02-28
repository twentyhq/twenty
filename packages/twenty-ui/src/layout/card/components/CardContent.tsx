import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { motion } from 'framer-motion';
import { type ComponentProps, type ReactNode, useContext } from 'react';

const StyledCardContentBase = styled.div<{
  divider?: boolean;
  theme: ThemeType;
}>`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(4)};

  border-bottom: ${({ divider, theme }) =>
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
  const { theme } = useContext(ThemeContext);
  return (
    <MotionCardContent
      theme={theme}
      className={className}
      divider={divider}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...motionProps}
    >
      {children}
    </MotionCardContent>
  );
};
