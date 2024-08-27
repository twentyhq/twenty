import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessagingDriverException,
  MessagingDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/messaging-driver.exception';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export type GetMessagesResponse = MessageWithParticipants[];

@Injectable()
export class MessagingGetMessagesService {
  constructor(
    private readonly gmailGetMessagesService: GmailGetMessagesService,
  ) {}

  public async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'handleAliases'
    >,
    workspaceId: string,
  ): Promise<GetMessagesResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.gmailGetMessagesService.getMessages(
          messageIds,
          connectedAccount,
          workspaceId,
        );
      default:
        throw new MessagingDriverException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessagingDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
