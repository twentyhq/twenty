import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { isDraftFolder } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-draft-folder.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

type SyncResult = {
  messageUids: number[];
  expungedUids: number[];
  currentUids?: number[];
};

@Injectable()
export class ImapSyncService {
  private readonly logger = new Logger(ImapSyncService.name);

  async syncFolder(
    client: ImapFlow,
    folderPath: string,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    options?: { isDraftFolder?: boolean },
  ): Promise<SyncResult> {
    this.validateUidValidity(previousCursor, mailboxState, folderPath);

    const isDraft =
      options?.isDraftFolder ??
      isDraftFolder(
        folderPath,
        typeof client.mailbox === 'object' && client.mailbox !== null
          ? client.mailbox.specialUse
          : undefined,
      );

    if (!isDraft) {
      const lastSyncedUid = previousCursor?.highestUid ?? 0;
      const { maxUid } = mailboxState;

      if (lastSyncedUid >= maxUid) {
        return {
          messageUids: [],
          expungedUids: [],
        };
      }

      const uidRange = `${lastSyncedUid + 1}:${maxUid}`;
      const uids = await client.search({ uid: uidRange }, { uid: true });

      if (!Array.isArray(uids)) {
        throw new MessageImportDriverException(
          `Failed to search UIDs in mailbox ${folderPath}`,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return {
        messageUids: uids.sort((a, b) => a - b),
        expungedUids: [],
      };
    }

    // Fetch live UIDs to discover new arrivals and expunged messages (Issue #26099)
    const currentLiveUids = await this.fetchLiveUids(client, mailboxState);

    const lastSyncedUid = previousCursor?.highestUid ?? 0;
    const messageUids = currentLiveUids.filter((uid) => uid > lastSyncedUid);

    const currentLiveUidSet = new Set(currentLiveUids);
    const expungedUids = (previousCursor?.knownUids ?? []).filter(
      (uid) => !currentLiveUidSet.has(uid),
    );

    return {
      messageUids,
      expungedUids,
      currentUids: currentLiveUids,
    };
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

  // Live UID search short-circuits on empty mailboxes and fails closed on invalid responses (Issue #26099)
  private async fetchLiveUids(
    client: ImapFlow,
    mailboxState: MailboxState,
  ): Promise<number[]> {
    if (mailboxState.messageCount === 0 || mailboxState.maxUid === 0) {
      return [];
    }

    const uids = await client.search({ all: true }, { uid: true });

    const hasExpectedMessages =
      typeof mailboxState.messageCount === 'number' &&
      mailboxState.messageCount > 0;

    if (!Array.isArray(uids) || (hasExpectedMessages && uids.length === 0)) {
      throw new MessageImportDriverException(
        'Failed to retrieve live UIDs from mailbox',
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    return uids.sort((a, b) => a - b);
  }
}
