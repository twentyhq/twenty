import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageBroadcastWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-broadcast.workspace-entity';
import { type MessageSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-subscription.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MESSAGE_TOPIC: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageTopicWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  description: string | null;
  subscriptionDefault: string;
  visibility: string;
  subscriptions: EntityRelation<MessageSubscriptionWorkspaceEntity[]>;
  broadcasts: EntityRelation<MessageBroadcastWorkspaceEntity[]>;
  searchVector: string;
}
