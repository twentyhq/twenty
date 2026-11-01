import { type ComponentProps } from 'react';

import { type ToastProvider } from '../src/components/feedback/Toast/ToastProvider';

export const TOAST_PROVIDER_PROP_DESCRIPTIONS = {
  children:
    'Application content and any Toasters sharing this provider’s independent notification store and lifecycle.',
  limit:
    'Reactive maximum number of visible toasts, defaulting to three. Must be a positive integer. Lowering it or adding above it dismisses the oldest visible notifications and calls their onClose once. Surviving IDs, order, and countdowns are preserved.',
} satisfies Partial<Record<keyof ComponentProps<typeof ToastProvider>, string>>;
