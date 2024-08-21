import { Injectable } from '@nestjs/common';

import { calendar_v3 as calendarV3 } from 'googleapis';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { GetMessageListResponse } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

@Injectable()
export class GmailGetMessageListService {
  constructor(private readonly gmailClientProvider: GmailClientProvider) {}

  public async getMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetMessageListResponse> {
    const gmailClient =
      await this.gmailClientProvider.getGmailClient(connectedAccount);

    let nextSyncToken: string | null | undefined;
    let nextPageToken: string | undefined;
    const events: calendarV3.Schema$Event[] = [];

    const hasMoreEvents = true;

    return { messageIds: [] };
  }
}
