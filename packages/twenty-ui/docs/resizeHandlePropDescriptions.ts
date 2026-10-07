import { type ComponentProps } from 'react';

import { type ResizeHandle } from '../src/primitives/layout/ResizeHandle/ResizeHandle';

export const RESIZE_HANDLE_PROP_DESCRIPTIONS = {
  axis: 'Pointer movement axis without `edge`: `y` for height or `x` for width.',
  direction:
    'Physical increasing direction. Omit to follow the horizontal text direction; use `normal` or `reverse` for a fixed physical edge.',
  edge: 'Physical panel edge. Determines the movement axis and increasing direction, independently of text direction.',
  placement:
    'Layout mode: `inline` stays in normal flow, `edge` positions the handle on the panel edge, and `gap` sits between panels. Defaults to `edge` when `edge` is set and `inline` otherwise.',
  scale:
    'Pointer scale or resolver sampled at pointer down. Movement is divided by this positive scale; keyboard steps are unchanged.',
  dragThreshold:
    'Physical pointer distance required before resizing starts. Movement below the threshold remains a click. Defaults to 5 with `edge` and 0 otherwise.',
  value:
    'Current controlled size. Update it in `onValueChange` and apply it to the element being resized.',
  defaultValue: 'Initial size when the handle owns its state.',
  onValueChange:
    'Called with the bounded size during pointer or keyboard interaction and with the restored value on cancellation.',
  onValueCommitted:
    'Called with the final size after a successful drag or an effective keyboard size change. Cancellation does not commit.',
  onResizeStart:
    'Called once with the first bounded drag value after the threshold is crossed.',
  onResizeEnd:
    'Called after a started drag ends, with its final value and whether it was cancelled. Cancellation restores the starting value within the current bounds.',
  onActivate: 'Called for a click without dragging, Enter, or Space.',
  min: 'Minimum allowed size.',
  max: 'Maximum allowed size.',
  step: 'Keyboard arrow increment. Pointer movement uses the pixel delta.',
  disabled: 'Disables resizing and removes the handle from the tab order.',
} satisfies Partial<Record<keyof ComponentProps<typeof ResizeHandle>, string>>;
