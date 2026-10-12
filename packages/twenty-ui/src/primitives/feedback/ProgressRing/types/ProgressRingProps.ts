import { type useRender } from '@base-ui/react/use-render';

export type ProgressRingProps = useRender.ComponentProps<'div'> & {
  value: number;
  size?: 'sm' | 'md';
  barColor?: string;
};
