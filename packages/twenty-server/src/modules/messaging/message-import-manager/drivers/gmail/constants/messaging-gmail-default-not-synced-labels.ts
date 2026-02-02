import { MESSAGING_GMAIL_CATEGORY_EXCLUSIONS } from './messaging-gmail-category-exclusions.constant';
import { MESSAGING_GMAIL_SYSTEM_EXCLUSIONS } from './messaging-gmail-system-exclusions.constant';

export const MESSAGING_GMAIL_DEFAULT_NOT_SYNCED_LABELS = [
  ...MESSAGING_GMAIL_CATEGORY_EXCLUSIONS,
  ...MESSAGING_GMAIL_SYSTEM_EXCLUSIONS,
];
