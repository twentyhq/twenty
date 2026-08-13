import { randomUUID } from 'node:crypto';

import { ImapFlow } from 'imapflow';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { sendEmail } from 'test/integration/utils/send-email.util';
import {
  type GreenmailServer,
  startGreenmailContainer,
} from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';
const HANDLE = `imap-smtp-outbound-${randomUUID()}@acme.test`;

const createMailbox = async ({
  greenmail,
  mailbox,
}: {
  greenmail: GreenmailServer;
  mailbox: string;
}): Promise<void> => {
  const client = new ImapFlow({
    host: greenmail.host,
    port: greenmail.imapPort,
    auth: { user: HANDLE.split('@')[0], pass: PASSWORD },
    secure: false,
  });

  await client.connect();

  try {
    await client.mailboxCreate(mailbox);
  } finally {
    await client.logout();
  }
};

describe('IMAP/SMTP outbound messaging (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageChannelId: string;
  let draftEmailTool: DraftEmailTool;

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    greenmail = await startGreenmailContainer({
      username: HANDLE,
      password: PASSWORD,
    });
    await createMailbox({ greenmail, mailbox: 'Sent' });
    await createMailbox({ greenmail, mailbox: 'Drafts' });

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
    draftEmailTool =
      getAppProviderByClassName<DraftEmailTool>('DraftEmailTool');

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

  it('sends a threaded SMTP message and appends it to the sent mailbox', async () => {
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

    await runMessageChannelSync(messageChannelId);

    expect(
      await findRecordNodesByFilter<{ subject: string; isDraft: boolean }>(
        'message',
        'messages',
        'subject isDraft',
        { subject: { eq: subject } },
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ subject, isDraft: false }),
      ]),
    );
  }, 300000);

  it('creates a draft, then sends and removes the synced draft', async () => {
    const subject = `IMAP/SMTP draft ${randomUUID()}`;

    const draftResult = await draftEmailTool.execute(
      {
        connectedAccountId,
        recipients: { to: HANDLE, cc: HANDLE, bcc: HANDLE },
        subject,
        body: '<p>SMTP draft body</p>',
        files: [],
      },
      { workspaceId: SEED_APPLE_WORKSPACE_ID },
    );

    expect(draftResult.success).toBe(true);

    await runMessageChannelSync(messageChannelId);

    const [draft] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
    }>('message', 'messages', 'id isDraft', { subject: { eq: subject } });

    expect(draft).toMatchObject({ isDraft: true });

    const sendResult = await sendEmail({
      connectedAccountId,
      to: HANDLE,
      subject,
      body: '<p>SMTP draft body</p>',
      draftMessageId: draft.id,
    });

    expect(sendResult).toMatchObject({ success: true });

    await runMessageChannelSync(messageChannelId);

    expect(
      await findRecordNodesByFilter<{ isDraft: boolean }>(
        'message',
        'messages',
        'isDraft',
        { subject: { eq: subject } },
      ),
    ).toEqual([expect.objectContaining({ isDraft: false })]);
  }, 300000);
});
