import { type WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatWebhook = UniversalFlatEntityFrom<
  WebhookEntity,
  'webhook'
>;
