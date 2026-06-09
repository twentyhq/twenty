import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme-constants';

const StyledContainer = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  overflow: hidden;
  position: relative;
  width: ${({ size }) => size}px;
`;

const StyledLayer = styled(motion.div)`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

type AnimatedIconCrossfadeProps = {
  isActive: boolean;
  ActiveIcon: IconComponent;
  InactiveIcon: IconComponent;
  size?: number;
};

export const AnimatedIconCrossfade = ({
  isActive,
  ActiveIcon,
  InactiveIcon,
  size,
}: AnimatedIconCrossfadeProps) => {
  const { theme } = useContext(ThemeContext);

  const iconSize = size ?? theme.icon.size.sm;

  return (
    <StyledContainer size={iconSize}>
      <StyledLayer
        initial={false}
        animate={{
          opacity: isActive ? 0 : 1,
          scale: isActive ? 0.85 : 1,
        }}
        transition={{
          duration: theme.animation.duration.fast,
          ease: 'easeInOut',
        }}
      >
        <InactiveIcon size={iconSize} />
      </StyledLayer>
      <StyledLayer
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.85,
        }}
        transition={{
          duration: theme.animation.duration.fast,
          ease: 'easeInOut',
        }}
      >
        <ActiveIcon size={iconSize} />
      </StyledLayer>
    </StyledContainer>
  );
};
