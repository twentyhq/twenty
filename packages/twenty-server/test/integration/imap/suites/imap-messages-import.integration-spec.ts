import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { appendMessageOverImap } from 'test/integration/utils/append-message-over-imap.util';
import { connectDovecotImapAccount } from 'test/integration/utils/connect-dovecot-imap-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { type DovecotServer } from 'test/integration/utils/start-dovecot-container.util';

const PASSWORD = 'dovecot-password';
const HANDLE = `imap-messages-import-${randomUUID()}@acme.test`;

describe('IMAP messages import (integration)', () => {
  let dovecot: DovecotServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  const readChannel = () =>
    getCoreRepository<MessageChannelEntity>(
      MessageChannelEntity,
    ).findOneByOrFail({ id: messageChannelId });

  const deliverMessage = ({
    subject,
    folder = 'INBOX',
  }: {
    subject: string;
    folder?: string;
  }) =>
    appendMessageOverImap({
      host: dovecot.host,
      port: dovecot.imapPort,
      username: HANDLE,
      password: PASSWORD,
      folder,
      from: `sender-${randomUUID()}@external.test`,
      to: HANDLE,
      subject,
    });

  beforeAll(async () => {
    ({ dovecot, connectedAccountId, messageChannelId } =
      await connectDovecotImapAccount({
        handle: HANDLE,
        password: PASSWORD,
      }));
  }, 300000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: true },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await dovecot?.stop().catch(() => undefined);
  });

  it('imports a message delivered to the mailbox', async () => {
    const subject = `IMAP message ${randomUUID()}`;

    await deliverMessage({ subject });

    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([subject])).toEqual([subject]);
  }, 300000);

  it('keeps the channel active when the mailbox has not changed', async () => {
    await runMessageChannelSync(messageChannelId);

    expect((await readChannel()).syncStatus).toBe(
      MessageChannelSyncStatus.ACTIVE,
    );
  }, 300000);

  it('imports a message that arrives after a sync cursor was persisted', async () => {
    const firstSubject = `IMAP incremental first ${randomUUID()}`;

    await deliverMessage({ subject: firstSubject });
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([firstSubject])).toEqual([
      firstSubject,
    ]);

    const secondSubject = `IMAP incremental second ${randomUUID()}`;

    await deliverMessage({ subject: secondSubject });
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([secondSubject])).toEqual([
      secondSubject,
    ]);
  }, 300000);

  it('records the server MODSEQ in the folder sync cursor', async () => {
    await runMessageChannelSync(messageChannelId);

    const inbox = await getCoreRepository<MessageFolderEntity>(
      MessageFolderEntity,
    ).findOneByOrFail({ messageChannelId, name: 'INBOX' });

    expect(JSON.parse(inbox.syncCursor ?? '{}')).toEqual(
      expect.objectContaining({
        modSeq: expect.any(String),
        highestUid: expect.any(Number),
        uidValidity: expect.any(Number),
      }),
    );
  }, 300000);

  it('skips opening a folder whose MODSEQ and UIDNEXT have not moved', async () => {
    await runMessageChannelSync(messageChannelId);

    const syncFolderSpy = jest.spyOn(
      getAppProviderByClassName<ImapSyncService>('ImapSyncService'),
      'syncFolder',
    );

    try {
      await runMessageChannelSync(messageChannelId);

      expect(syncFolderSpy).not.toHaveBeenCalled();

      await deliverMessage({ subject: `IMAP skip path ${randomUUID()}` });
      await runMessageChannelSync(messageChannelId);

      expect(syncFolderSpy).toHaveBeenCalled();
    } finally {
      syncFolderSpy.mockRestore();
    }
  }, 300000);

  it('imports a message that arrives after unrelated activity in another folder', async () => {
    await deliverMessage({
      subject: `IMAP sent activity ${randomUUID()}`,
      folder: 'Sent',
    });
    await runMessageChannelSync(messageChannelId);

    const subject = `IMAP inbox after sent activity ${randomUUID()}`;

    await deliverMessage({ subject });
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([subject])).toEqual([subject]);
  }, 300000);

  // Servers that scope HIGHESTMODSEQ to the account rather than the mailbox hand
  // us a cursor MODSEQ higher than any message the folder will receive next.
  // Dovecot is compliant and cannot produce that state, so it is written directly.
  it('imports new mail when the stored MODSEQ is ahead of the mailbox', async () => {
    await runMessageChannelSync(messageChannelId);

    const messageFolderRepository =
      getCoreRepository<MessageFolderEntity>(MessageFolderEntity);
    const inbox = await messageFolderRepository.findOneByOrFail({
      messageChannelId,
      name: 'INBOX',
    });

    await messageFolderRepository.update(inbox.id, {
      syncCursor: JSON.stringify({
        ...JSON.parse(inbox.syncCursor ?? '{}'),
        modSeq: '999999',
      }),
    });

    const subject = `IMAP stale modseq ${randomUUID()}`;

    await deliverMessage({ subject });
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([subject])).toEqual([subject]);
  }, 300000);
});
