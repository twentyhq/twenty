import { useTheme } from '@emotion/react';
import { motion } from 'framer-motion';

export type AnimatedCheckmarkProps = React.ComponentProps<
  typeof motion.path
> & {
  isAnimating?: boolean;
  color?: string;
  duration?: number;
  size?: number;
};

export const AnimatedCheckmark = ({
  isAnimating = false,
  color,
  duration = 0.5,
  size = 28,
}: AnimatedCheckmarkProps) => {
  const theme = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      width={size}
      height={size}
    >
      <motion.path
        fill="none"
        stroke={color ?? theme.grayScale.gray1}
        strokeWidth={4}
        d="M14 27l7.8 7.8L38 14"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={isAnimating ? '1' : '0'}
        animate={{ strokeDashoffset: isAnimating ? '0' : '1' }}
        transition={{ duration }}
      />
    </svg>
  );
};
