import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

export type DiscoveredMessageFolder = Pick<
  MessageFolderEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId' | 'parentFolderId'
>;

export type MessageFolder = Pick<
  MessageFolderEntity,
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
      ConnectedAccountEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'connectionParameters'
      | 'workspaceId'
    >,
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
  ): Promise<DiscoveredMessageFolder[]>;
};
