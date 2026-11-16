import { type ProgressRootProps } from '../../Progress/types/ProgressRootProps';

export type ProgressBarProps = ProgressRootProps & {
  size?: 'xs' | 'sm' | 'md';
  barColor?: string;
  backgroundColor?: string;
  withBorderRadius?: boolean;
  withMinimumFillWidth?: boolean;
};
