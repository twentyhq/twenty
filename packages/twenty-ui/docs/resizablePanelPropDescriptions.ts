import { type ResizablePanelProps } from '../src/components/layout/ResizablePanel/types/ResizablePanelProps';

export const RESIZABLE_PANEL_PROP_DESCRIPTIONS = {
  side: 'Physical panel edge. Left and top reverse the size change; right and bottom follow pointer movement.',
  variant:
    'An absolute edge inside a positioned panel, or a gap in the surrounding layout.',
  size: 'Controlled committed size. The panel maintains a separate live size during a drag.',
  defaultSize: 'Initial committed size when uncontrolled. Defaults to min.',
  min: 'Minimum allowed size.',
  max: 'Maximum allowed size.',
  gapSize: 'Space occupied by the gap variant, in CSS pixels.',
  showHandle:
    'Shows the grip on the edge variant. Does not disable interaction.',
  scale:
    'Positive CSS zoom or scale factor, or a function evaluated at pointer down. Pointer distance is divided by this value.',
  step: 'Keyboard arrow increment in size units. Pointer movement is not snapped.',
  disabled:
    'Prevents resizing and collapse and removes the separator from the tab order.',
  onSizeChange:
    'Reports live size updates and the restored starting size after cancellation. Apply this size to the panel layout.',
  onSizeCommit:
    'Reports the final size after a successful drag or a keyboard size change. Save controlled sizes here.',
  onResizeStart:
    'Reports the first candidate size when a pointer drag passes the movement threshold.',
  onResizeEnd:
    'Reports whether the pointer drag was cancelled and its final or restored size.',
  onCollapse:
    'Requests collapse on a click without dragging or on Enter or Space. The application controls panel visibility.',
} satisfies Partial<Record<keyof ResizablePanelProps, string>>;
