import React, { useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface CircularProgressBarProps {
  size?: number;
  barWidth?: number;
  barColor?: string;
}

export const CircularProgressBar = ({
  size = 50,
  barWidth = 5,
  barColor = 'currentColor',
}: CircularProgressBarProps) => {
  const controls = useAnimation();

  const circumference = useMemo(
    () => 2 * Math.PI * (size / 2 - barWidth),
    [size, barWidth],
  );

  useEffect(() => {
    const animateIndeterminate = async () => {
      const baseSegment = Math.max(5, circumference / 10); // Adjusting for smaller values

      // Adjusted sequence based on baseSegment
      const dashSequences = [
        `${baseSegment} ${circumference - baseSegment}`,
        `${baseSegment * 2} ${circumference - baseSegment * 2}`,
        `${baseSegment * 3} ${circumference - baseSegment * 3}`,
        `${baseSegment * 2} ${circumference - baseSegment * 2}`,
        `${baseSegment} ${circumference - baseSegment}`,
      ];

      await controls.start({
        strokeDasharray: dashSequences,
        rotate: [0, 720],
        transition: {
          strokeDasharray: {
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
          rotate: {
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        },
      });
    };

    animateIndeterminate();
  }, [circumference, controls]);

  return (
    <motion.svg width={size} height={size} animate={controls}>
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - barWidth}
        fill="none"
        stroke={barColor}
        strokeWidth={barWidth}
        strokeLinecap="round"
      />
    </motion.svg>
  );
};
