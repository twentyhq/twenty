import { randomUUID } from 'node:crypto';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { sendEmail } from 'test/integration/utils/send-email.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';
const HANDLE = `imap-smtp-outbound-${randomUUID()}@acme.test`;

describe('IMAP/SMTP outbound messaging (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageChannelId: string;

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
            username: HANDLE.split('@')[0],
            password: PASSWORD,
            connectionSecurity: EmailConnectionSecurity.NONE,
          },
          SMTP: {
            host: greenmail.host,
            port: greenmail.smtpPort,
            username: HANDLE.split('@')[0],
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

    await runMessageChannelSync(messageChannelId);
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

  it('sends a threaded SMTP message through GraphQL and persists it', async () => {
    const subject = `IMAP/SMTP outbound ${randomUUID()}`;

    const result = await sendEmail({
      connectedAccountId,
      to: HANDLE,
      cc: HANDLE,
      bcc: HANDLE,
      subject,
      body: '<p>SMTP reply body</p>',
      inReplyTo: '<smtp-parent@example.com>',
    });

    expect(result).toMatchObject({ success: true });

    const [message] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
      messageThreadId: string | null;
      text: string | null;
    }>('message', 'messages', 'id isDraft messageThreadId text', {
      subject: { eq: subject },
    });

    expect(message).toMatchObject({
      isDraft: false,
      messageThreadId: expect.any(String),
      text: 'SMTP reply body',
    });
    expect(
      await findRecordNodesByFilter<{
        messageChannelId: string;
      }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId',
        { messageId: { eq: message.id } },
      ),
    ).toEqual([expect.objectContaining({ messageChannelId })]);
    expect(
      await findRecordNodesByFilter<{ handle: string; role: string }>(
        'messageParticipant',
        'messageParticipants',
        'handle role',
        { messageId: { eq: message.id } },
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ handle: HANDLE, role: 'TO' }),
        expect.objectContaining({ handle: HANDLE, role: 'CC' }),
        expect.objectContaining({ handle: HANDLE, role: 'BCC' }),
      ]),
    );
  }, 300000);
});
