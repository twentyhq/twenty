import { type INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from '@/ai/constants/inbox-object-names-by-legacy-name.const';

export type LegacyInboxObjectName =
  keyof typeof INBOX_OBJECT_NAMES_BY_LEGACY_NAME;
