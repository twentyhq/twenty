import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type GetMessageListsArgs = {
  messageChannel: Pick<
    MessageChannelEntity,
    'syncCursor' | 'id' | 'messageFolderImportPolicy'
  >;
  connectedAccount: Pick<
    ConnectedAccountEntity,
    | 'provider'
    | 'accessToken'
    | 'refreshToken'
    | 'id'
    | 'handle'
    | 'connectionParameters'
  >;
  messageFolders: MessageFolder[];
};
