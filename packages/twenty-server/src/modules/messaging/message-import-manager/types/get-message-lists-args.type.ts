import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export type GetMessageListsArgs = {
  messageChannel: Pick<MessageChannelWorkspaceEntity, 'syncCursor' | 'id'>;
  connectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    'provider' | 'refreshToken' | 'id' | 'handle' | 'connectionParameters'
  >;
  messageFolders: Pick<
    MessageFolderWorkspaceEntity,
    'name' | 'syncCursor' | 'id'
  >[];
};
