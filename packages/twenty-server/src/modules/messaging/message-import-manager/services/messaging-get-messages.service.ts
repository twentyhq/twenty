import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export type GetMessagesResponse = MessageWithParticipants[];

@Injectable()
export class MessagingGetMessagesService {
  constructor(
    private readonly gmailGetMessagesService: GmailGetMessagesService,
  ) {}

  public async getMessages(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
  ): Promise<GetMessagesResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.gmailGetMessagesService.getMessages(connectedAccount);
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported.`,
        );
    }
  }
}
