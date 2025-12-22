import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type GetMessageListsArgs = {
  messageChannel: Pick<MessageChannelWorkspaceEntity, 'syncCursor' | 'id'>;
  connectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    | 'provider'
    | 'accessToken'
    | 'refreshToken'
    | 'id'
    | 'handle'
    | 'connectionParameters'
  >;
  messageFolders: MessageFolder[];
};
