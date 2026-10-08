import { Injectable, Logger } from '@nestjs/common';

import { type ExpungeEvent, type ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

type SyncResult = {
  messageUids: number[];
  expungedMessageUids: number[];
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
    );

    const expungedMessageUids = await this.fetchExpungedMessageUids(
      client,
      folderPath,
      previousCursor,
    );

    return { messageUids, expungedMessageUids };
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
  ): Promise<number[]> {
    const lastSyncedUid = previousCursor?.highestUid ?? 0;
    const { maxUid } = mailboxState;

    if (lastSyncedUid >= maxUid) {
      return [];
    }

    const uidRange = `${lastSyncedUid + 1}:${maxUid}`;
    const uids = await client.search({ uid: uidRange }, { uid: true });

    if (!Array.isArray(uids)) {
      return [];
    }

    return uids;
  }

  private async fetchExpungedMessageUids(
    client: ImapFlow,
    folderPath: string,
    previousCursor: ImapSyncCursor | null,
  ): Promise<number[]> {
    if (
      !client.enabled.has('QRESYNC') ||
      !isDefined(previousCursor?.modSeq) ||
      previousCursor.highestUid === 0
    ) {
      return [];
    }

    const expungedMessageUids: number[] = [];

    const collectVanishedMessageUid = (expungeEvent: ExpungeEvent) => {
      if (
        expungeEvent.vanished &&
        expungeEvent.path === folderPath &&
        isDefined(expungeEvent.uid)
      ) {
        expungedMessageUids.push(expungeEvent.uid);
      }
    };

    client.on('expunge', collectVanishedMessageUid);

    try {
      await client.fetchAll(
        `1:${previousCursor.highestUid}`,
        { uid: true },
        { uid: true, changedSince: BigInt(previousCursor.modSeq) },
      );
    } finally {
      client.off('expunge', collectVanishedMessageUid);
    }

    return expungedMessageUids;
  }
}
