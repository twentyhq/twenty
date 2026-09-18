import styles from './CircularProgressBar.module.scss';

type CircularProgressBarProps = {
  size?: number;
  barWidth?: number;
  barColor?: string;
};

export const CircularProgressBar = ({
  size = 50,
  barWidth = 5,
  barColor = 'currentColor',
}: CircularProgressBarProps) => (
  <svg className={styles.svg} width={size} height={size}>
    <circle
      className={styles.circle}
      cx={size / 2}
      cy={size / 2}
      r={size / 2 - barWidth}
      fill="none"
      stroke={barColor}
      strokeWidth={barWidth}
      strokeLinecap="round"
      pathLength={100}
    />
  </svg>
);
