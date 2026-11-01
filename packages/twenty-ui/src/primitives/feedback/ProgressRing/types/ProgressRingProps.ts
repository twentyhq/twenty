import { type ProgressRootProps } from '../../Progress/types/ProgressRootProps';

export type ProgressRingProps = ProgressRootProps & {
  size?: 'sm' | 'md';
  barColor?: string;
};
