import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { ImapFlow } from 'imapflow';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { appendMessageOverImap } from 'test/integration/utils/append-message-over-imap.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import {
  type DovecotServer,
  startDovecotContainer,
} from 'test/integration/utils/start-dovecot-container.util';
import {
  type ImapProxy,
  startImapProxyEmptyingRev2Search,
} from 'test/integration/utils/start-imap-proxy-emptying-rev2-search.util';

const PASSWORD = 'dovecot-password';
const HANDLE = `imap-rev2-empty-search-${randomUUID()}@acme.test`;

describe('IMAP server returning empty searches in IMAP4rev2 mode (integration)', () => {
  let dovecot: DovecotServer;
  let proxy: ImapProxy;
  let connectedAccountId: string;
  let messageChannelId: string;

  const deliverMessage = (subject: string) =>
    appendMessageOverImap({
      host: dovecot.host,
      port: dovecot.imapPort,
      username: HANDLE,
      password: PASSWORD,
      folder: 'INBOX',
      from: `sender-${randomUUID()}@external.test`,
      to: HANDLE,
      subject,
    });

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: ['*'] },
    });

    dovecot = await startDovecotContainer({ password: PASSWORD });

    proxy = await startImapProxyEmptyingRev2Search({
      targetHost: dovecot.host,
      targetPort: dovecot.imapPort,
    });

    const { data } = await saveImapSmtpCaldavAccount({
      input: {
        handle: HANDLE,
        connectionParameters: {
          IMAP: {
            host: proxy.host,
            port: proxy.port,
            username: HANDLE,
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
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await proxy?.stop().catch(() => undefined);
    await dovecot?.stop().catch(() => undefined);
  });

  it('answers searches with no results once IMAP4rev2 is enabled', async () => {
    await deliverMessage(`IMAP rev2 proxy check ${randomUUID()}`);

    const client = new ImapFlow({
      host: proxy.host,
      port: proxy.port,
      secure: false,
      auth: { user: HANDLE, pass: PASSWORD },
      logger: false,
    });

    await client.connect();

    try {
      const lock = await client.getMailboxLock('INBOX');

      try {
        expect(await client.search({ all: true }, { uid: true })).toEqual([]);
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }, 300000);

  it('imports new mail even though IMAP4rev2 searches come back empty', async () => {
    const subject = `IMAP rev2 empty search ${randomUUID()}`;

    await deliverMessage(subject);
    await runMessageChannelSync(messageChannelId);

    expect(await findImportedMessageSubjects([subject])).toEqual([subject]);
  }, 300000);
});
