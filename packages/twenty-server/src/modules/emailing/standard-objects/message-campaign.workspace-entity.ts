import { type EmailsMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export class MessageCampaignWorkspaceEntity extends BaseWorkspaceEntity {
  subject: string | null;
  bodyTemplate: string | null;
  fromAddress: EmailsMetadata | null;
  status: string;
  sentAt: Date | null;
  unsubscribeTopicId: string | null;
  list: EntityRelation<MessageListWorkspaceEntity> | null;
  listId: string | null;
  messages: EntityRelation<MessageWorkspaceEntity[]>;
  recipients: EntityRelation<MessageParticipantWorkspaceEntity[]>;
  searchVector: string;
}
