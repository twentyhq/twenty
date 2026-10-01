import { type ComponentProps } from 'react';

import { type ResizeHandle } from '../src/primitives/layout/ResizeHandle/ResizeHandle';

export const RESIZE_HANDLE_PROP_DESCRIPTIONS = {
  axis: 'Pointer movement axis: `y` for height or `x` for width.',
  direction:
    'Physical increasing direction. Omit to follow the horizontal text direction; use `normal` or `reverse` for a fixed physical edge.',
  scale:
    'Pointer scale or resolver sampled at pointer down. Movement is divided by this positive scale; keyboard steps are unchanged.',
  dragThreshold:
    'Physical pointer distance required before resizing starts. Movement below the threshold remains a click.',
  value: 'Controlled size. Apply the value to the element being resized.',
  defaultValue: 'Initial size when the handle owns its state.',
  onValueChange:
    'Called with the bounded size after pointer or keyboard interaction.',
  onValueCommit:
    'Called with the final size after a successful drag or an effective keyboard size change. Cancellation does not commit.',
  onResizeStart:
    'Called once with the first bounded drag value after the threshold is crossed.',
  onResizeEnd:
    'Called after a started drag ends, with its latest live value and whether it was cancelled. Cancellation keeps the live value until the caller changes it.',
  onActivate: 'Called for a click without dragging, Enter, or Space.',
  min: 'Minimum allowed size.',
  max: 'Maximum allowed size.',
  step: 'Keyboard arrow increment. Pointer movement uses the pixel delta.',
  disabled: 'Disables resizing and removes the handle from the tab order.',
} satisfies Partial<Record<keyof ComponentProps<typeof ResizeHandle>, string>>;
