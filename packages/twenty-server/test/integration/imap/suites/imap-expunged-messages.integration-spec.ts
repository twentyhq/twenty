import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { appendMessageOverImap } from 'test/integration/utils/append-message-over-imap.util';
import { connectDovecotImapAccount } from 'test/integration/utils/connect-dovecot-imap-account.util';
import { deleteMessageOverImap } from 'test/integration/utils/delete-message-over-imap.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { type DovecotServer } from 'test/integration/utils/start-dovecot-container.util';

const PASSWORD = 'dovecot-password';
const HANDLE = `imap-expunged-messages-${randomUUID()}@acme.test`;

describe('IMAP expunged messages (integration)', () => {
  let dovecot: DovecotServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  const appendMessage = ({
    subject,
    folder,
  }: {
    subject: string;
    folder: string;
  }) =>
    appendMessageOverImap({
      host: dovecot.host,
      port: dovecot.imapPort,
      username: HANDLE,
      password: PASSWORD,
      folder,
      from: HANDLE,
      to: `recipient-${randomUUID()}@external.test`,
      subject,
    });

  const deleteMessage = ({
    subject,
    folder,
  }: {
    subject: string;
    folder: string;
  }) =>
    deleteMessageOverImap({
      host: dovecot.host,
      port: dovecot.imapPort,
      username: HANDLE,
      password: PASSWORD,
      folder,
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
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await dovecot?.stop().catch(() => undefined);
  });

  it('removes a draft that the mail client replaced with a new version', async () => {
    const firstDraftSubject = `IMAP draft v1 ${randomUUID()}`;
    const secondDraftSubject = `IMAP draft v2 ${randomUUID()}`;

    await appendMessage({ subject: firstDraftSubject, folder: 'Drafts' });
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([firstDraftSubject])).toEqual([
      firstDraftSubject,
    ]);

    await appendMessage({ subject: secondDraftSubject, folder: 'Drafts' });
    await deleteMessage({ subject: firstDraftSubject, folder: 'Drafts' });
    await runMessageChannelSync(messageChannelId);

    expect(
      await findImportedMessageSubjects([
        firstDraftSubject,
        secondDraftSubject,
      ]),
    ).toEqual([secondDraftSubject]);
  }, 300000);

  it('removes a message deleted from the inbox', async () => {
    const keptSubject = `IMAP kept ${randomUUID()}`;
    const deletedSubject = `IMAP deleted ${randomUUID()}`;

    await appendMessage({ subject: keptSubject, folder: 'INBOX' });
    await appendMessage({ subject: deletedSubject, folder: 'INBOX' });
    await runMessageChannelSync(messageChannelId);

    await deleteMessage({ subject: deletedSubject, folder: 'INBOX' });
    await runMessageChannelSync(messageChannelId);

    expect(
      await findImportedMessageSubjects([keptSubject, deletedSubject]),
    ).toEqual([keptSubject]);
  }, 300000);

  it('removes messages deleted before the sync cursor tracked the message count', async () => {
    const deletedSubject = `IMAP deleted before upgrade ${randomUUID()}`;

    await appendMessage({ subject: deletedSubject, folder: 'INBOX' });
    await runMessageChannelSync(messageChannelId);

    const messageFolderRepository =
      getCoreRepository<MessageFolderEntity>(MessageFolderEntity);
    const inbox = await messageFolderRepository.findOneByOrFail({
      messageChannelId,
      name: 'INBOX',
    });
    const { highestUid, uidValidity, modSeq } = JSON.parse(
      inbox.syncCursor ?? '{}',
    );

    await messageFolderRepository.update(inbox.id, {
      syncCursor: JSON.stringify({ highestUid, uidValidity, modSeq }),
    });

    await deleteMessage({ subject: deletedSubject, folder: 'INBOX' });
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([deletedSubject])).toEqual([]);
    expect(
      JSON.parse(
        (await messageFolderRepository.findOneByOrFail({ id: inbox.id }))
          .syncCursor ?? '{}',
      ),
    ).toEqual(expect.objectContaining({ messageCount: expect.any(Number) }));
  }, 300000);
});
