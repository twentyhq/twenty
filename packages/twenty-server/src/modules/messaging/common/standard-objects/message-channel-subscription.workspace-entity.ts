import { registerEnumType } from '@nestjs/graphql';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export enum MessageChannelSubscriptionProvider {
  GMAIL_PUBSUB = 'GMAIL_PUBSUB',
  MICROSOFT_GRAPH = 'MICROSOFT_GRAPH',
  IMAP_IDLE = 'IMAP_IDLE',
}

export enum MessageChannelSubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

registerEnumType(MessageChannelSubscriptionProvider, {
  name: 'MessageChannelSubscriptionProvider',
});

registerEnumType(MessageChannelSubscriptionStatus, {
  name: 'MessageChannelSubscriptionStatus',
});

export class MessageChannelSubscriptionWorkspaceEntity extends BaseWorkspaceEntity {
  provider: MessageChannelSubscriptionProvider;
  status: MessageChannelSubscriptionStatus;
  expiresAt: string | null;
  providerSubscriptionId: string | null;
  lastNotificationAt: string | null;
  failureCount: number;
  lastError: string | null;
  messageChannel: EntityRelation<MessageChannelWorkspaceEntity>;
  messageChannelId: string;
}
