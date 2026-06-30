import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';

export type FlatWebhook = FlatEntityFrom<WebhookEntity>;
