import { type ResizeHandleProps } from '@ui/primitives/layout/ResizeHandle/types/ResizeHandleProps';

export type PanelResizeHandleProps = Omit<
  ResizeHandleProps,
  | 'axis'
  | 'direction'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onValueCommit'
  | 'onResizeStart'
  | 'onResizeEnd'
  | 'dragThreshold'
  | 'children'
  | 'min'
  | 'max'
> & {
  edge: 'left' | 'right' | 'top' | 'bottom';
  placement?: 'edge' | 'gap';
  size: number;
  minSize: number;
  maxSize: number;
  gapSize?: number;
  showGrip?: boolean;
  onSizePreview?: (size: number) => void;
  onSizeCommitted?: (size: number) => void;
  onResizeStart?: (size: number) => void;
  onResizeEnd?: (details: { cancelled: boolean; size: number }) => void;
};
