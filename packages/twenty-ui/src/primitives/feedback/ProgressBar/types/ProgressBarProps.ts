import { type ProgressRootProps } from '../../Progress/types/ProgressRootProps';

export type ProgressBarProps = ProgressRootProps & {
  size?: 'sm' | 'md';
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
  withMinimumFillWidth?: boolean;
};
