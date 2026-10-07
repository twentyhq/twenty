import { type useRender } from '@base-ui/react/use-render';

type ResizeHandlePositionProps =
  | {
      edge: 'left' | 'right' | 'top' | 'bottom';
      placement?: 'inline' | 'edge' | 'gap';
      axis?: never;
      direction?: never;
    }
  | {
      edge?: never;
      placement?: 'inline' | 'gap';
      axis?: 'x' | 'y';
      direction?: 'normal' | 'reverse';
    };

export type ResizeHandleProps = useRender.ComponentProps<'div'> &
  ResizeHandlePositionProps & {
    scale?: number | (() => number);
    dragThreshold?: number;
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    onValueCommitted?: (value: number) => void;
    onResizeStart?: (value: number) => void;
    onResizeEnd?: (details: { cancelled: boolean; value: number }) => void;
    onActivate?: () => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  };
