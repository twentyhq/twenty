import { type ResizeHandleProps } from '@ui/primitives/layout/ResizeHandle/types/ResizeHandleProps';

export type ResizablePanelProps = Omit<
  ResizeHandleProps,
  | 'axis'
  | 'direction'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onValueCommit'
  | 'onActivate'
  | 'dragThreshold'
  | 'children'
  | 'min'
  | 'max'
> & {
  side: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'edge' | 'gap';
  size?: number;
  defaultSize?: number;
  min: number;
  max: number;
  gapSize?: number;
  showHandle?: boolean;
  onSizeChange?: (size: number) => void;
  onSizeCommit?: (size: number) => void;
  onCollapse?: () => void;
};
