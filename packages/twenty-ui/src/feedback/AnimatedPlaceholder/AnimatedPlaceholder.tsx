import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import { BACKGROUND } from '@ui/feedback/AnimatedPlaceholder/constants/Background';
import { DARK_BACKGROUND } from '@ui/feedback/AnimatedPlaceholder/constants/DarkBackground';
import { DARK_MOVING_IMAGE } from '@ui/feedback/AnimatedPlaceholder/constants/DarkMovingImage';
import { MOVING_IMAGE } from '@ui/feedback/AnimatedPlaceholder/constants/MovingImage';
import { useThemeColorScheme } from '@ui/theme-constants';

import styles from './AnimatedPlaceholder.module.scss';

const PARALLAX_OFFSET_IN_PX = 2;

export type AnimatedPlaceholderType =
  | keyof typeof BACKGROUND
  | keyof typeof MOVING_IMAGE;

type AnimatedPlaceholderProps = {
  type: AnimatedPlaceholderType;
};

export const AnimatedPlaceholder = ({ type }: AnimatedPlaceholderProps) => {
  const colorScheme = useThemeColorScheme();
  const movingImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const movingImage = movingImageRef.current;
    if (movingImage === null) {
      return;
    }

    const setParallax = (offsetX: number, offsetY: number) => {
      movingImage.style.setProperty('--parallax-x', `${offsetX}px`);
      movingImage.style.setProperty('--parallax-y', `${offsetY}px`);
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        'touches' in event ? event.touches[0].clientY : event.clientY;

      setParallax(
        (clientX / window.innerWidth) * 2 * PARALLAX_OFFSET_IN_PX -
          PARALLAX_OFFSET_IN_PX,
        (clientY / window.innerHeight) * 2 * PARALLAX_OFFSET_IN_PX -
          PARALLAX_OFFSET_IN_PX,
      );
    };

    const handleLeave = () => {
      setParallax(0, 0);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const isLarge = type === 'error500' || type === 'error404';

  return (
    <div className={styles.container}>
      <img
        src={colorScheme === 'dark' ? DARK_BACKGROUND[type] : BACKGROUND[type]}
        alt=""
        draggable={false}
        className={clsx(
          styles.backgroundImage,
          isLarge && styles.backgroundImageLarge,
        )}
      />
      <img
        ref={movingImageRef}
        src={
          colorScheme === 'dark' ? DARK_MOVING_IMAGE[type] : MOVING_IMAGE[type]
        }
        alt=""
        draggable={false}
        className={clsx(styles.movingImage, isLarge && styles.movingImageLarge)}
      />
    </div>
  );
};
