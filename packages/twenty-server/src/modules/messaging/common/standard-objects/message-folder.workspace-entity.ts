import { registerEnumType } from '@nestjs/graphql';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export enum MessageFolderPendingSyncAction {
  FOLDER_DELETION = 'FOLDER_DELETION',
  NONE = 'NONE',
}

registerEnumType(MessageFolderPendingSyncAction, {
  name: 'MessageFolderPendingSyncAction',
});

export class MessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  messageChannel: EntityRelation<MessageChannelWorkspaceEntity>;
  syncCursor: string | null;
  isSentFolder: boolean;
  isSynced: boolean;
  parentFolderId: string | null;
  externalId: string | null;
  pendingSyncAction: MessageFolderPendingSyncAction;
  messageChannelId: string;
}
