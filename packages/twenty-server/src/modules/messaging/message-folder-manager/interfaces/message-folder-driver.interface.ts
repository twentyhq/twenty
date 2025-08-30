import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId'
>;

export interface MessageFolderDriver {
  getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle' | 'connectionParameters'
    >,
  ): Promise<MessageFolder[]>;
}
