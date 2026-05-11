import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';

import { canUseQresync } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/can-use-qresync.util';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';

type SyncResult = {
  messageUids: number[];
  // True when the server's UID validity has changed and all previously stored
  // message UIDs for this folder are now invalid. The caller must clear the
  // folder's sync cursor and re-import all messages from scratch.
  requiresFullResync: boolean;
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
    if (this.hasUidValidityChanged(previousCursor, mailboxState, folderPath)) {
      // UID validity changing means every stored UID is stale. Fetch all
      // messages from scratch by treating this as a first-time sync.
      const messageUids = await this.fetchNewMessageUids(
        client,
        null,
        mailboxState,
        folderPath,
      );

      return { messageUids, requiresFullResync: true };
    }

    const messageUids = await this.fetchNewMessageUids(
      client,
      previousCursor,
      mailboxState,
      folderPath,
    );

    return { messageUids, requiresFullResync: false };
  }

  // Returns true when the server reports a different UID validity than the one
  // stored in our cursor, indicating a full folder resync is required.
  private hasUidValidityChanged(
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folderPath: string,
  ): boolean {
    const previousUidValidity = previousCursor?.uidValidity ?? 0;
    const { uidValidity } = mailboxState;

    if (previousUidValidity !== 0 && previousUidValidity !== uidValidity) {
      this.logger.warn(
        `UID validity changed from ${previousUidValidity} to ${uidValidity} in ${folderPath}. Performing full resync.`,
      );

      return true;
    }

    return false;
  }

  private async fetchNewMessageUids(
    client: ImapFlow,
    previousCursor: ImapSyncCursor | null,
    mailboxState: MailboxState,
    folderPath: string,
  ): Promise<number[]> {
    const lastSyncedUid = previousCursor?.highestUid ?? 0;
    const { maxUid } = mailboxState;

    if (canUseQresync(client, previousCursor, mailboxState)) {
      this.logger.debug(`Using QRESYNC for folder ${folderPath}`);

      try {
        return await this.fetchWithQresync(
          client,
          lastSyncedUid,
          BigInt(previousCursor!.modSeq!),
        );
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
  ): Promise<number[]> {
    if (lastSyncedUid >= highestAvailableUid) {
      return [];
    }

    const uidRange = `${lastSyncedUid + 1}:${highestAvailableUid}`;
    const uids = await client.search({ uid: uidRange }, { uid: true });

    if (!uids || !Array.isArray(uids)) {
      return [];
    }

    return uids;
  }

  private async fetchWithQresync(
    client: ImapFlow,
    lastSyncedUid: number,
    lastModSeq: bigint,
  ): Promise<number[]> {
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

    return uids;
  }
}
