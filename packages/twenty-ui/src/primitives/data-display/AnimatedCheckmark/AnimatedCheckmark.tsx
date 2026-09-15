import { useTheme } from '@ui/theme-constants';

import styles from './AnimatedCheckmark.module.scss';

export type AnimatedCheckmarkProps = {
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
      <path
        className={isAnimating ? styles.animatedPath : undefined}
        fill="none"
        stroke={color ?? theme.grayScale.gray1}
        strokeWidth={4}
        d="M14 27l7.8 7.8L38 14"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={isAnimating ? 0 : 1}
        style={
          {
            '--animated-checkmark-duration': `${duration}s`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
};
