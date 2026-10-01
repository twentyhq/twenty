import { type ComponentProps } from 'react';

import { type ResizeHandle } from '../src/primitives/layout/ResizeHandle/ResizeHandle';

export const RESIZE_HANDLE_PROP_DESCRIPTIONS = {
  axis: 'Pointer movement axis: `y` for height or `x` for width.',
  value: 'Controlled size. Apply the value to the element being resized.',
  defaultValue: 'Initial size when the handle owns its state.',
  onValueChange:
    'Called with the bounded size after pointer or keyboard interaction.',
  min: 'Minimum allowed size.',
  max: 'Maximum allowed size.',
  step: 'Keyboard arrow increment. Pointer movement uses the pixel delta.',
  disabled: 'Disables resizing and removes the handle from the tab order.',
} satisfies Partial<Record<keyof ComponentProps<typeof ResizeHandle>, string>>;
