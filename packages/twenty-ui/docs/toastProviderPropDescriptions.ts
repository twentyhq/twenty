import { type ComponentProps } from 'react';

import { type ToastProvider } from '../src/components/feedback/Toast/ToastProvider';

export const TOAST_PROVIDER_PROP_DESCRIPTIONS = {
  children:
    'Application content and a Toaster sharing this notification store.',
  limit:
    'Maximum number of visible toasts. Adding a toast above the limit dismisses the oldest visible notifications.',
} satisfies Partial<Record<keyof ComponentProps<typeof ToastProvider>, string>>;
