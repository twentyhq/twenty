import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export const SEARCH_FIELDS_FOR_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_MESSAGE_FOLDER: FieldTypeAndNameMetadata[] =
  [];

export class MessageChannelMessageAssociationMessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  messageChannelMessageAssociation: EntityRelation<MessageChannelMessageAssociationWorkspaceEntity>;
  messageChannelMessageAssociationId: string;
  messageFolder: EntityRelation<MessageFolderWorkspaceEntity>;
  messageFolderId: string;
}
