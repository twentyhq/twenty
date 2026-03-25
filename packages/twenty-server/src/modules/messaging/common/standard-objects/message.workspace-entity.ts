import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

const SUBJECT_FIELD_NAME = 'subject';

export const SEARCH_FIELDS_FOR_MESSAGE: FieldTypeAndNameMetadata[] = [
  { name: SUBJECT_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageWorkspaceEntity extends BaseWorkspaceEntity {
  headerMessageId: string | null;
  subject: string | null;
  text: string | null;
  receivedAt: Date | null;
  messageThread: EntityRelation<MessageThreadWorkspaceEntity> | null;
  messageThreadId: string | null;
  messageParticipants: EntityRelation<MessageParticipantWorkspaceEntity[]>;
  messageChannelMessageAssociations: EntityRelation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
}
