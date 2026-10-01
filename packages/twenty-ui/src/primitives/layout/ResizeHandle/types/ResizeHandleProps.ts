import { type useRender } from '@base-ui/react/use-render';

export type ResizeHandleProps = useRender.ComponentProps<'div'> & {
  axis?: 'x' | 'y';
  direction?: 'normal' | 'reverse';
  scale?: number | (() => number);
  dragThreshold?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  onResizeStart?: (value: number) => void;
  onResizeEnd?: (details: { cancelled: boolean; value: number }) => void;
  onActivate?: () => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};
