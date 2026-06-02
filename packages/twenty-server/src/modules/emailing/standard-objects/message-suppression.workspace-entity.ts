import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type MessageTopicWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic.workspace-entity';

const EMAIL_ADDRESS_FIELD_NAME = 'emailAddress';

export const SEARCH_FIELDS_FOR_MESSAGE_SUPPRESSION: FieldTypeAndNameMetadata[] =
  [{ name: EMAIL_ADDRESS_FIELD_NAME, type: FieldMetadataType.TEXT }];

export class MessageSuppressionWorkspaceEntity extends BaseWorkspaceEntity {
  emailAddress: string;
  reason: string;
  source: string;
  providerEventId: string | null;
  topic: EntityRelation<MessageTopicWorkspaceEntity> | null;
  topicId: string | null;
  searchVector: string;
}
