import { type LegacyInboxObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/legacy-inbox-object-name.type';

export type InboxObjectNamesByLegacyName = Record<
  LegacyInboxObjectName,
  string
>;
