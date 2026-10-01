import { type ComponentProps } from 'react';

import { type Breadcrumb } from '../src/primitives/navigation/Breadcrumb/Breadcrumb';

export const BREADCRUMB_PROP_DESCRIPTIONS = {
  links:
    'Ordered trail items. Each item accepts `children`, `href`, `render`, and `title`. The final item represents the current page.',
  render:
    'Caller-supplied root element or renderer. Preserve the navigation landmark and forward the supplied props and ref.',
} satisfies Partial<Record<keyof ComponentProps<typeof Breadcrumb>, string>>;
