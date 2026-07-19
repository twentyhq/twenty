import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

export class MessageChannelMessageAssociationMessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  messageChannelMessageAssociation: EntityRelation<MessageChannelMessageAssociationWorkspaceEntity>;
  messageChannelMessageAssociationId: string;
  messageFolder: EntityRelation<MessageFolderEntity>;
  messageFolderId: string;
}
