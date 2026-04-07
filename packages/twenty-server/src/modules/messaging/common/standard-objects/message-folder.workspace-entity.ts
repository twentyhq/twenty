import { registerEnumType } from '@nestjs/graphql';

import {
  FieldMetadataType,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';

export { MessageFolderPendingSyncAction };

registerEnumType(MessageFolderPendingSyncAction, {
  name: 'MessageFolderPendingSyncAction',
});

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MESSAGE_FOLDER: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  syncCursor: string | null;
  isSentFolder: boolean;
  isSynced: boolean;
  parentFolderId: string | null;
  externalId: string | null;
  pendingSyncAction: MessageFolderPendingSyncAction;
  messageChannelId: string;
  messageChannelMessageAssociationMessageFolders: EntityRelation<
    MessageChannelMessageAssociationMessageFolderWorkspaceEntity[]
  >;
}
