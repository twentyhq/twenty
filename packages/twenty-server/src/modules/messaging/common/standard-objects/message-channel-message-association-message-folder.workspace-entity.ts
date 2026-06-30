import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export class MessageChannelMessageAssociationMessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  messageChannelMessageAssociation: EntityRelation<MessageChannelMessageAssociationWorkspaceEntity>;
  messageChannelMessageAssociationId: string;
  messageFolder: EntityRelation<MessageFolderWorkspaceEntity>;
  messageFolderId: string;
}
