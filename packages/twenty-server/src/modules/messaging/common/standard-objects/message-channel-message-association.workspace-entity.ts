import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class MessageChannelMessageAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  messageExternalId: string | null;
  messageThreadExternalId: string | null;
  direction: MessageDirection;
  messageChannelId: string;
  message: EntityRelation<MessageWorkspaceEntity> | null;
  messageId: string;
  messageFolders: EntityRelation<
    MessageChannelMessageAssociationMessageFolderWorkspaceEntity[]
  >;
  accountOwner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  accountOwnerId: string | null;
  handle: string | null;
}
