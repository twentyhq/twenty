import { type PanelResizeHandleProps } from '../src/components/layout/PanelResizeHandle/types/PanelResizeHandleProps';

export const PANEL_RESIZE_HANDLE_PROP_DESCRIPTIONS = {
  edge: 'Physical panel edge. Left and top reverse the size change; right and bottom follow pointer movement.',
  placement:
    'An absolute edge inside a positioned panel, or a gap in the surrounding layout.',
  size: 'Required committed size in CSS pixels. The handle maintains a separate live size during a drag.',
  minSize: 'Minimum allowed size.',
  maxSize: 'Maximum allowed size.',
  gapSize: 'Space occupied by the gap placement, in CSS pixels.',
  showGrip:
    'Shows the grip on the edge placement. Does not disable interaction.',
  scale:
    'Positive CSS zoom or scale factor, or a function evaluated at pointer down. Pointer distance is divided by this value.',
  step: 'Keyboard arrow increment in size units. Pointer movement is not snapped.',
  disabled:
    'Prevents resizing and activation and removes the separator from the tab order.',
  onSizePreview:
    'Reports live size updates and the restored starting size after cancellation. Apply this size to the panel layout.',
  onSizeCommitted:
    'Reports the final size after a successful drag or a keyboard size change. Save controlled sizes here.',
  onResizeStart:
    'Reports the first candidate size when a pointer drag passes the movement threshold.',
  onResizeEnd:
    'Reports whether the pointer drag was cancelled and its final or restored size.',
  onActivate:
    'Requests activation on a click without dragging or on Enter or Space. The application decides whether to collapse or close the panel.',
} satisfies Partial<Record<keyof PanelResizeHandleProps, string>>;
