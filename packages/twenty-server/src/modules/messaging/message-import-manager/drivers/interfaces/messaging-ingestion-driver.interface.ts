import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GetMessagesResponse } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import { GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import { GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

export interface MessagingIngestionDriver {
  getMessageLists(args: GetMessageListsArgs): Promise<GetMessageListsResponse>;
  getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'handleAliases'
      | 'userWorkspaceId'
      | 'connectionParameters'
    >,
    messageChannel: Pick<
      MessageChannelEntity,
      'messageFolders' | 'messageFolderImportPolicy'
    >,
  ): Promise<GetMessagesResponse>;
}
