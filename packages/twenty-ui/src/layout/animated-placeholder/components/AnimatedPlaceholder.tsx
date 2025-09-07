import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { BACKGROUND } from '@ui/layout/animated-placeholder/constants/Background';
import { DARK_BACKGROUND } from '@ui/layout/animated-placeholder/constants/DarkBackground';
import { DARK_MOVING_IMAGE } from '@ui/layout/animated-placeholder/constants/DarkMovingImage';
import { MOVING_IMAGE } from '@ui/layout/animated-placeholder/constants/MovingImage';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useEventListener } from '@ui/utilities/events/hooks/useEventListener';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 100px;
`;

interface StyledImageProps {
  type: string;
}

const StyledBackgroundImage = styled.img<StyledImageProps>`
  max-height: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '245px' : '160px'};
  max-width: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '245px' : '160px'};
`;

const StyledMovingImage = styled(motion.img)<StyledImageProps>`
  position: absolute;
  max-width: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '185px' : '130px'};
  max-height: ${({ type }) =>
    type === 'error500' || type === 'error404' ? '185px' : '130px'};
  z-index: 2;
`;

export type AnimatedPlaceholderType =
  | keyof typeof BACKGROUND
  | keyof typeof MOVING_IMAGE;

interface AnimatedPlaceholderProps {
  type: AnimatedPlaceholderType;
}

export const AnimatedPlaceholder = ({ type }: AnimatedPlaceholderProps) => {
  const theme = useTheme();

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const translateX = useTransform(x, [0, windowSize.width || 1], [-2, 2]);
  const translateY = useTransform(y, [0, windowSize.height || 1], [-2, 2]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    x.set(window.innerWidth / 2);
    y.set(window.innerHeight / 2);
  }, [x, y]);

  const handleMove = (event: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    x.set(clientX);
    y.set(clientY);
  };

  const handleLeave = () => {
    animate(x, windowSize.width / 2, {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    });
    animate(y, windowSize.height / 2, {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    });
  };

  useEventListener('mousemove', handleMove);
  useEventListener('touchmove', handleMove);
  useEventListener(
    'mouseleave',
    handleLeave,
    typeof window !== 'undefined' ? window.document : undefined,
  );

  return (
    <StyledContainer>
      <StyledBackgroundImage
        src={theme.name === 'dark' ? DARK_BACKGROUND[type] : BACKGROUND[type]}
        alt="Background"
        type={type}
      />
      <StyledMovingImage
        src={
          theme.name === 'dark' ? DARK_MOVING_IMAGE[type] : MOVING_IMAGE[type]
        }
        alt="Moving"
        style={{ translateX, translateY }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        type={type}
      />
    </StyledContainer>
  );
};
