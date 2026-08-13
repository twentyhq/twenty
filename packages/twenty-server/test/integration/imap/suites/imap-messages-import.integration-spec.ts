import { randomUUID } from 'node:crypto';

import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { deliverMailOverSmtp } from 'test/integration/utils/deliver-mail-over-smtp.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';

// GreenMail registers a declared user under the local part of its address, so
// that is the login, while the channel keeps the full address as its handle.
const HANDLE = `imap-messages-import-${randomUUID()}@acme.test`;
const MAILBOX_LOGIN = HANDLE.split('@')[0];

describe('IMAP messages import (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  const readChannel = () =>
    getCoreRepository<MessageChannelEntity>(
      MessageChannelEntity,
    ).findOneByOrFail({ id: messageChannelId });

  const deliverMessage = (subject: string) =>
    deliverMailOverSmtp({
      host: greenmail.host,
      port: greenmail.smtpPort,
      from: `sender-${randomUUID()}@acme.test`,
      to: HANDLE,
      subject,
    });

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    greenmail = await startGreenmailContainer({
      username: HANDLE,
      password: PASSWORD,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          IMAP: {
            host: greenmail.host,
            port: greenmail.imapPort,
            username: MAILBOX_LOGIN,
            password: PASSWORD,
            connectionSecurity: EmailConnectionSecurity.NONE,
          },
        },
      },
      expectToFail: false,
    });

    connectedAccountId = data.connectedAccountId;
    messageChannelId = (
      await getCoreRepository<MessageChannelEntity>(
        MessageChannelEntity,
      ).findOneByOrFail({ connectedAccountId })
    ).id;
  }, 300000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: true },
    }).catch(() => undefined);

    if (connectedAccountId) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await greenmail?.stop().catch(() => undefined);
  });

  it('imports a message delivered to the mailbox', async () => {
    const subject = `IMAP message ${randomUUID()}`;

    await deliverMessage(subject);

    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([subject])).toEqual([subject]);
  }, 300000);

  it('keeps the channel active when the mailbox has not changed', async () => {
    await runMessageChannelSync(messageChannelId);

    expect((await readChannel()).syncStatus).toBe(
      MessageChannelSyncStatus.ACTIVE,
    );
  }, 300000);

  it('fails the channel when the server becomes unreachable', async () => {
    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: messageChannelId },
      { syncCursor: '' },
    );

    await greenmail.stop();

    await runMessageChannelSync(messageChannelId);

    expect((await readChannel()).syncStatus).not.toBe(
      MessageChannelSyncStatus.ACTIVE,
    );
  }, 300000);
});
