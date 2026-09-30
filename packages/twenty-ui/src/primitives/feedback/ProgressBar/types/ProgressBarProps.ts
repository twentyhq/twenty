export type ProgressBarProps = {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
  withGrowIn?: boolean;
  withGlint?: boolean;
  withSpringFill?: boolean;
  withMinimumFillWidth?: boolean;
  ariaLabel?: string;
  onGrowInComplete?: () => void;
};
