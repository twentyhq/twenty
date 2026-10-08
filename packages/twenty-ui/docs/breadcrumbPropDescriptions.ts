import { type ComponentProps } from 'react';

import { type Breadcrumb } from '../src/primitives/navigation/Breadcrumb/Breadcrumb';

export const BREADCRUMB_PROP_DESCRIPTIONS = {
  links:
    'Ordered trail items with native anchor attributes, event handlers, ref, children and element or callback render composition. Items with href default to anchors; other items default to text. The final item defaults to aria-current="page". An explicit aria-current value is preserved, including false.',
  'aria-label':
    'Accessible navigation name. Defaults to Breadcrumb; supply a localized name or use aria-labelledby.',
  className: 'Class merged onto the root navigation element.',
  style: 'Inline styles applied to the root navigation element.',
  ref: 'Ref to the root nav, or the DOM element supplied through render.',
  render:
    'Caller-supplied root element or renderer. Preserve the navigation landmark and forward the supplied props and ref.',
} satisfies Partial<Record<keyof ComponentProps<typeof Breadcrumb>, string>>;
