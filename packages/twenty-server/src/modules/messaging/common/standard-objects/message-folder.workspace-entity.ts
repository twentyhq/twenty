import { registerEnumType } from '@nestjs/graphql';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export enum MessageFolderPendingSyncAction {
  FOLDER_DELETION = 'FOLDER_DELETION',
  NONE = 'NONE',
}

registerEnumType(MessageFolderPendingSyncAction, {
  name: 'MessageFolderPendingSyncAction',
});

export class MessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  messageChannel: Relation<MessageChannelWorkspaceEntity>;
  syncCursor: string | null;
  isSentFolder: boolean;
  isSynced: boolean;
  parentFolderId: string | null;
  externalId: string | null;
  pendingSyncAction: MessageFolderPendingSyncAction;
  messageChannelId: string;
}
