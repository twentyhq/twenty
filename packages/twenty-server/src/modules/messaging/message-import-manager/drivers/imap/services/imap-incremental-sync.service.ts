import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';

import { canUseQresync } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/can-use-qresync.util';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

import { ImapMessageFetcherService } from './imap-message-fetcher.service';

type SyncStrategyResult = {
  messages: { uid: number }[];
  messageExternalUidsToDelete: number[];
};

@Injectable()
export class ImapIncrementalSyncService {
  private readonly logger = new Logger(ImapIncrementalSyncService.name);

  constructor(
    private readonly imapMessageFetcherService: ImapMessageFetcherService,
  ) {}

  public async syncMessages(
    client: ImapFlow,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folder: string,
  ): Promise<SyncStrategyResult> {
    const messageExternalUidsToDelete = await this.checkUidValidityChange(
      client,
      previousCursor,
      mailboxState,
      folder,
    );

    const messages = await this.selectSyncStrategy(
      client,
      previousCursor,
      mailboxState,
      folder,
    );

    return {
      messages,
      messageExternalUidsToDelete,
    };
  }

  private async checkUidValidityChange(
    client: ImapFlow,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folder: string,
  ): Promise<number[]> {
    const lastUidValidity = previousCursor?.uidValidity ?? 0;
    const { uidValidity } = mailboxState;

    if (lastUidValidity !== 0 && lastUidValidity !== uidValidity) {
      this.logger.log(
        `UID validity changed from ${lastUidValidity} to ${uidValidity} in ${folder}. Full resync required.`,
      );

      return this.imapMessageFetcherService.getAllMessageUids(client);
    }

    return [];
  }

  private async selectSyncStrategy(
    client: ImapFlow,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folder: string,
  ): Promise<{ uid: number }[]> {
    const lastSeenUid = previousCursor?.highestUid ?? 0;
    const supportsQresync = client.capabilities.has('QRESYNC');
    const { maxUid } = mailboxState;

    if (canUseQresync(supportsQresync, previousCursor, mailboxState)) {
      this.logger.log(`Using QRESYNC for folder ${folder}`);
      const lastModSeq = BigInt(previousCursor!.modSeq!);

      try {
        return await this.imapMessageFetcherService.getMessagesWithQresync(
          client,
          lastSeenUid,
          lastModSeq,
        );
      } catch (error) {
        this.logger.warn(
          `QRESYNC failed for folder ${folder}, falling back to UID search: ${error.message}`,
        );

        return this.imapMessageFetcherService.getMessagesWithUidSearch(
          client,
          lastSeenUid,
          maxUid,
        );
      }
    }

    this.logger.log(`Using standard UID search for folder ${folder}`);

    return this.imapMessageFetcherService.getMessagesWithUidSearch(
      client,
      lastSeenUid,
      maxUid,
    );
  }
}
