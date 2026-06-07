import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageTopicWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const NAME_FIELD_NAME = 'name';
const SUBJECT_FIELD_NAME = 'subject';

export const SEARCH_FIELDS_FOR_MESSAGE_CAMPAIGN: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: SUBJECT_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageCampaignWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  subject: string | null;
  bodyTemplate: string | null;
  fromAddress: string | null;
  replyTo: string | null;
  status: string;
  recipientSource: string;
  recipientViewId: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  sentCount: number;
  bouncedCount: number;
  failedCount: number;
  topic: EntityRelation<MessageTopicWorkspaceEntity> | null;
  topicId: string | null;
  messages: EntityRelation<MessageWorkspaceEntity[]>;
  searchVector: string;
}
