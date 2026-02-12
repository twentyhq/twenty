import { MESSAGING_GMAIL_EXCLUDED_CATEGORY_LABELS } from './messaging-gmail-excluded-category-labels.constant';
import { MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS } from './messaging-gmail-excluded-system-labels.constant';

export const MESSAGING_GMAIL_DEFAULT_EXCLUDED_LABELS = [
  ...MESSAGING_GMAIL_EXCLUDED_CATEGORY_LABELS,
  ...MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS,
];
