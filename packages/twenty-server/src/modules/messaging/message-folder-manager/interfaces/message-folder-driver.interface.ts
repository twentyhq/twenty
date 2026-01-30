import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export type DiscoveredMessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId' | 'parentFolderId'
>;

export type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  | 'name'
  | 'isSynced'
  | 'isSentFolder'
  | 'externalId'
  | 'parentFolderId'
  | 'id'
  | 'syncCursor'
  | 'pendingSyncAction'
>;

export type MessageFolderDriver = {
  getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'connectionParameters'
    >,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolderImportPolicy'
    >,
  ): Promise<DiscoveredMessageFolder[]>;
};
