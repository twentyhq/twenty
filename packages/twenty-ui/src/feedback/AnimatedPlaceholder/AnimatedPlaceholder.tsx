import { clsx } from 'clsx';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useContext, useEffect } from 'react';

import { BACKGROUND } from '@ui/feedback/AnimatedPlaceholder/constants/Background';
import { DARK_BACKGROUND } from '@ui/feedback/AnimatedPlaceholder/constants/DarkBackground';
import { DARK_MOVING_IMAGE } from '@ui/feedback/AnimatedPlaceholder/constants/DarkMovingImage';
import { MOVING_IMAGE } from '@ui/feedback/AnimatedPlaceholder/constants/MovingImage';
import { ThemeContext } from '@ui/theme-constants';

import styles from './AnimatedPlaceholder.module.scss';

const getMovingImageSize = (type: string) =>
  type === 'error500' || type === 'error404' ? '185px' : '130px';

export type AnimatedPlaceholderType =
  | keyof typeof BACKGROUND
  | keyof typeof MOVING_IMAGE;

type AnimatedPlaceholderProps = {
  type: AnimatedPlaceholderType;
};

export const AnimatedPlaceholder = ({ type }: AnimatedPlaceholderProps) => {
  const { colorScheme } = useContext(ThemeContext);

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
    <div className={styles.container}>
      <img
        src={colorScheme === 'dark' ? DARK_BACKGROUND[type] : BACKGROUND[type]}
        alt=""
        className={clsx(
          styles.backgroundImage,
          (type === 'error500' || type === 'error404') &&
            styles.backgroundImageLarge,
        )}
      />
      <motion.img
        src={
          colorScheme === 'dark' ? DARK_MOVING_IMAGE[type] : MOVING_IMAGE[type]
        }
        alt=""
        style={{
          position: 'absolute',
          maxWidth: getMovingImageSize(type),
          maxHeight: getMovingImageSize(type),
          zIndex: 2,
          translateX,
          translateY,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      />
    </div>
  );
};
