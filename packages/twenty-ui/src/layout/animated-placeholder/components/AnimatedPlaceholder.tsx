import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { BACKGROUND } from '@ui/layout/animated-placeholder/constants/Background';
import { DARK_BACKGROUND } from '@ui/layout/animated-placeholder/constants/DarkBackground';
import { DARK_MOVING_IMAGE } from '@ui/layout/animated-placeholder/constants/DarkMovingImage';
import { MOVING_IMAGE } from '@ui/layout/animated-placeholder/constants/MovingImage';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

  const x = useMotionValue(window.innerWidth / 2);
  const y = useMotionValue(window.innerHeight / 2);

  const translateX = useTransform(x, [0, window.innerWidth], [-2, 2]);
  const translateY = useTransform(y, [0, window.innerHeight], [-2, 2]);

  useEffect(() => {
    const handleMove = (event: MouseEvent | TouchEvent) => {
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        'touches' in event ? event.touches[0].clientY : event.clientY;

      x.set(clientX);
      y.set(clientY);
    };

    const handleLeave = () => {
      animate(x, window.innerWidth / 2, {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      });
      animate(y, window.innerHeight / 2, {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.document.removeEventListener('mouseleave', handleLeave);
    };
  }, [x, y]);

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
