import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';

export type GetMessageListResponse = {
  messageIds: string[];
};

@Injectable()
export class CalendarGetMessageListService {
  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
  ) {}

  public async getMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetMessageListResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.gmailGetMessageListService.getMessageList(
          connectedAccount,
          syncCursor,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported.`,
        );
    }
  }
}
