import { randomUUID } from 'node:crypto';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { deliverMailOverSmtp } from 'test/integration/utils/deliver-mail-over-smtp.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryMessageFolders } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

const HANDLE = `imap-folder-discovery-${randomUUID()}@acme.test`;

describe('IMAP folder discovery (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  beforeAll(async () => {
    // The IMAP driver routes through the SSRF guard, which rejects the
    // container's private address before the connection is attempted.
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    greenmail = await startGreenmailContainer();

    // GreenMail creates the user on delivery, so the mailbox has to exist
    // before the driver can authenticate against it.
    await deliverMailOverSmtp({
      host: greenmail.host,
      port: greenmail.smtpPort,
      from: `sender-${randomUUID()}@acme.test`,
      to: HANDLE,
      subject: `IMAP mailbox seed ${randomUUID()}`,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          IMAP: {
            host: greenmail.host,
            port: greenmail.imapPort,
            username: HANDLE,
            password: HANDLE,
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

  it('discovers the mailboxes exposed by the IMAP server', async () => {
    await runMessageChannelSync(messageChannelId);

    const folders = await queryMessageFolders(messageChannelId);

    expect(folders.map((folder) => folder.name)).toContain('INBOX');
  }, 300000);
});
