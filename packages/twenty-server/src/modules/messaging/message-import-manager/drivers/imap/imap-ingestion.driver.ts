import { Injectable } from '@nestjs/common';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { MessagingIngestionDriver } from 'src/modules/messaging/message-import-manager/drivers/interfaces/messaging-ingestion-driver.interface';
import { GetMessagesResponse } from 'src/modules/messaging/message-import-manager/services/messaging-get-messages.service';
import { GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import { GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

@Injectable()
export class ImapIngestionDriver implements MessagingIngestionDriver {
  constructor(
    private readonly imapGetMessageListService: ImapGetMessageListService,
    private readonly imapGetMessagesService: ImapGetMessagesService,
  ) {}

  async getMessageLists(
    args: GetMessageListsArgs,
  ): Promise<GetMessageListsResponse> {
    return this.imapGetMessageListService.getMessageLists(args);
  }

  async getMessages(
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
  ): Promise<GetMessagesResponse> {
    return this.imapGetMessagesService.getMessages(
      messageIds,
      connectedAccount,
    );
  }
}
