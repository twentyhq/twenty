import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { canUseQresync } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/can-use-qresync.util';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

type SyncResult = {
  messageUids: number[];
};

@Injectable()
export class ImapSyncService {
  private readonly logger = new Logger(ImapSyncService.name);

  async syncFolder(
    client: ImapFlow,
    folderPath: string,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
  ): Promise<SyncResult> {
    this.validateUidValidity(previousCursor, mailboxState, folderPath);

    const messageUids = await this.fetchNewMessageUids(
      client,
      previousCursor,
      mailboxState,
      folderPath,
    );

    return { messageUids };
  }

  private validateUidValidity(
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folderPath: string,
  ): void {
    const previousUidValidity = previousCursor?.uidValidity ?? 0;
    const { uidValidity } = mailboxState;

    if (previousUidValidity !== 0 && previousUidValidity !== uidValidity) {
      this.logger.warn(
        `UID validity changed from ${previousUidValidity} to ${uidValidity} in ${folderPath}. Full resync required.`,
      );

      throw new MessageImportDriverException(
        `IMAP UID validity changed for folder ${folderPath}`,
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );
    }
  }

  private async fetchNewMessageUids(
    client: ImapFlow,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folderPath: string,
  ): Promise<number[]> {
    const lastSyncedUid = previousCursor?.highestUid ?? 0;
    const { maxUid } = mailboxState;

    // Safety check: if lastSyncedUid is significantly behind maxUid, we might want to batch.
    // However, for now, we'll focus on robustness.

    if (canUseQresync(client, previousCursor, mailboxState)) {
      this.logger.debug(`Using QRESYNC for folder ${folderPath}`);

      try {
        const lastModSeq = BigInt(previousCursor!.modSeq!);

        return await this.fetchWithQresync(client, lastSyncedUid, lastModSeq);
      } catch (error) {
        this.logger.warn(
          `QRESYNC failed for ${folderPath}, falling back to UID range: ${error.message}`,
        );
      }
    }

    this.logger.debug(
      `Using UID range fetch for folder ${folderPath} (range: ${lastSyncedUid + 1}:${maxUid})`,
    );

    return this.fetchWithUidRange(client, lastSyncedUid, maxUid);
  }

  private async fetchWithUidRange(
    client: ImapFlow,
    lastSyncedUid: number,
    highestAvailableUid: number,
  ): Promise<number[]> {
    if (lastSyncedUid >= highestAvailableUid) {
      return [];
    }

    const uidRange = `${lastSyncedUid + 1}:${highestAvailableUid}`;

    try {
      const uids = await client.search({ uid: uidRange }, { uid: true });

      if (!uids || !Array.isArray(uids)) {
        return [];
      }

      return uids.map(Number);
    } catch (error) {
      this.logger.error(
        `UID search failed for range ${uidRange}: ${error.message}`,
      );

      throw error;
    }
  }

  private async fetchWithQresync(
    client: ImapFlow,
    lastSyncedUid: number,
    lastModSeq: bigint,
  ): Promise<number[]> {
    try {
      const uids = await client.search(
        {
          modseq: lastModSeq + BigInt(1),
          uid: `${lastSyncedUid + 1}:*`,
        },
        { uid: true },
      );

      if (!uids || !Array.isArray(uids) || !uids.length) {
        return [];
      }

      this.logger.debug(`QRESYNC found ${uids.length} new/modified messages`);

      return uids.map(Number);
    } catch (error) {
      this.logger.error(`QRESYNC search failed: ${error.message}`);
      throw error;
    }
  }
}
