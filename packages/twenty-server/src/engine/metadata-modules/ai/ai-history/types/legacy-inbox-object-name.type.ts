import { type INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from 'src/engine/metadata-modules/ai/ai-history/constants/inbox-object-names-by-legacy-name.constant';

export type LegacyInboxObjectName =
  keyof typeof INBOX_OBJECT_NAMES_BY_LEGACY_NAME;
