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
  isPartial: boolean;
};

@Injectable()
export class ImapSyncService {
  private readonly logger = new Logger(ImapSyncService.name);

  private static readonly MAX_UID_FETCH_SIZE = 1000;

  async syncFolder(
    client: ImapFlow,
    folderPath: string,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
  ): Promise<SyncResult> {
    this.validateUidValidity(previousCursor, mailboxState, folderPath);

    return await this.fetchNewMessageUids(
      client,
      previousCursor,
      mailboxState,
      folderPath,
    );
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
  ): Promise<SyncResult> {
    const lastSyncedUid = previousCursor?.highestUid ?? 0;
    const { maxUid } = mailboxState;

    if (canUseQresync(client, previousCursor, mailboxState)) {
      this.logger.debug(`Using QRESYNC for folder ${folderPath}`);

      try {
        const result = await this.fetchWithQresync(
          client,
          lastSyncedUid,
          BigInt(previousCursor!.modSeq!),
        );

        return result;
      } catch (error) {
        this.logger.warn(
          `QRESYNC failed for ${folderPath}, falling back to UID range: ${error.message}`,
        );
      }
    }

    this.logger.debug(`Using UID range fetch for folder ${folderPath}`);

    return this.fetchWithUidRange(client, lastSyncedUid, maxUid);
  }

  private async fetchWithUidRange(
    client: ImapFlow,
    lastSyncedUid: number,
    highestAvailableUid: number,
  ): Promise<SyncResult> {
    if (lastSyncedUid >= highestAvailableUid) {
      return { messageUids: [], isPartial: false };
    }

    const nextUid = lastSyncedUid + 1;
    const endUid = Math.min(
      nextUid + ImapSyncService.MAX_UID_FETCH_SIZE - 1,
      highestAvailableUid,
    );

    const isPartial = endUid < highestAvailableUid;
    const uidRange = `${nextUid}:${endUid}`;

    this.logger.debug(
      `Fetching UID range ${uidRange} (max available: ${highestAvailableUid})`,
    );

    const uids = await client.search({ uid: uidRange }, { uid: true });

    if (!uids || !Array.isArray(uids)) {
      return { messageUids: [], isPartial: false };
    }

    // Cast as number[] because imapflow search with {uid: true} returns numbers
    return { messageUids: uids as number[], isPartial };
  }

  private async fetchWithQresync(
    client: ImapFlow,
    lastSyncedUid: number,
    lastModSeq: bigint,
  ): Promise<SyncResult> {
    const uids = (await client.search(
      {
        modseq: lastModSeq + BigInt(1),
        uid: `${lastSyncedUid + 1}:*`,
      },
      { uid: true },
    )) as number[];

    if (!uids || !Array.isArray(uids) || !uids.length) {
      return { messageUids: [], isPartial: false };
    }

    const isPartial = uids.length > ImapSyncService.MAX_UID_FETCH_SIZE;
    const messageUids = isPartial
      ? uids.slice(0, ImapSyncService.MAX_UID_FETCH_SIZE)
      : uids;

    this.logger.debug(
      `QRESYNC found ${uids.length} new/modified messages${isPartial ? ` (returning first ${ImapSyncService.MAX_UID_FETCH_SIZE})` : ''}`,
    );

    return { messageUids, isPartial };
  }
}
