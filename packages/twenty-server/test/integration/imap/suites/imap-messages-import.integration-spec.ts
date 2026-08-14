import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { connectGreenmailImapAccount } from 'test/integration/utils/connect-greenmail-imap-account.util';
import { deliverMailOverSmtp } from 'test/integration/utils/deliver-mail-over-smtp.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { type GreenmailServer } from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';

// GreenMail registers a declared user under the local part of its address, so
// that is the login, while the channel keeps the full address as its handle.
const HANDLE = `imap-messages-import-${randomUUID()}@acme.test`;

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
      from: `sender-${randomUUID()}@external.test`,
      to: HANDLE,
      subject,
    });

  beforeAll(async () => {
    ({ greenmail, connectedAccountId, messageChannelId } =
      await connectGreenmailImapAccount({
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
});
