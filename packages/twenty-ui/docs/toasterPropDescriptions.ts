import { type ComponentProps } from 'react';

import { type Toaster } from '../src/components/feedback/Toaster/Toaster';

export const TOASTER_PROP_DESCRIPTIONS = {
  container:
    'Portal destination. Omit to use the theme container or document.body; null defers rendering.',
  getToastProps:
    'Customizes each notification’s Toast props. The toaster owns id, ref, and dismissal.',
  render: 'Custom root element composed through Base UI.',
} satisfies Partial<Record<keyof ComponentProps<typeof Toaster>, string>>;
