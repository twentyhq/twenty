import { Injectable, Logger } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { parseImapError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-error.util';
import { parseImapMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-message-list-fetch-error.util';
import { parseImapMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-messages-import-error.util';

@Injectable()
export class ImapHandleErrorService {
  private readonly logger = new Logger(ImapHandleErrorService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async handleError(
    error: Error,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    this.logger.error(
      `IMAP error for message channel ${messageChannelId}: ${error.message}`,
      error.stack,
    );

    try {
      const messageChannelRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
          workspaceId,
          'messageChannel',
        );

      await messageChannelRepository.update(
        { id: messageChannelId },
        {
          syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
        },
      );
    } catch (handleErrorError) {
      this.logger.error(
        `Error handling IMAP error: ${handleErrorError.message}`,
        handleErrorError.stack,
      );
    }
  }

  public handleImapMessageListFetchError(error: Error): void {
    const imapError = parseImapError(error);

    if (imapError) {
      throw imapError;
    }

    throw parseImapMessageListFetchError(error);
  }

  public handleImapMessagesImportError(
    error: Error,
    messageExternalId: string,
  ): void {
    const imapError = parseImapError(error);

    if (imapError) {
      throw imapError;
    }

    throw parseImapMessagesImportError(error, messageExternalId);
  }
}
