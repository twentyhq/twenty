import { type ComponentProps } from 'react';

import { type Toaster } from '../src/components/feedback/Toaster/Toaster';

export const TOASTER_PROP_DESCRIPTIONS = {
  container:
    'Portal destination. Omit to use the theme container or document.body; null defers rendering. The provider retains visible notifications and pauses their countdowns while no Toaster is rendered.',
  getToastProps:
    'Adapts notification content and presentation. The provider owns id, dismissal, and the shared countdown. Set timing through enqueueToast or updateToast; duration and progress overrides must match across Toasters sharing a provider.',
  render: 'Custom root element composed through Base UI.',
} satisfies Partial<Record<keyof ComponentProps<typeof Toaster>, string>>;
