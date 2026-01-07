import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export class MessageChannelMessageAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  messageExternalId: string | null;
  messageThreadExternalId: string | null;
  direction: MessageDirection;
  messageChannel: Relation<MessageChannelWorkspaceEntity> | null;
  messageChannelId: string;
  message: Relation<MessageWorkspaceEntity> | null;
  messageId: string;
}
