import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';

export const FLAT_WEBHOOK_EDITABLE_PROPERTIES = [
  'targetUrl',
  'operations',
  'description',
  'secret',
] as const satisfies (keyof FlatWebhook)[];
