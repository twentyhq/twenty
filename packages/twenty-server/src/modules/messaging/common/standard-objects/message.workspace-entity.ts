import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

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
