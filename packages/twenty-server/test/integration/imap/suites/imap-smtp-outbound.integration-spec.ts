import { randomUUID } from 'node:crypto';

import { ImapFlow } from 'imapflow';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { findPersistedMessages } from 'test/integration/utils/find-persisted-messages.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
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

const appendDraft = async ({
  greenmail,
  subject,
}: {
  greenmail: GreenmailServer;
  subject: string;
}): Promise<void> => {
  const client = new ImapFlow({
    host: greenmail.host,
    port: greenmail.imapPort,
    auth: { user: HANDLE.split('@')[0], pass: PASSWORD },
    secure: false,
  });

  await client.connect();

  try {
    await client.append(
      'Drafts',
      [
        `From: ${HANDLE}`,
        `To: ${HANDLE}`,
        `Cc: ${HANDLE}`,
        `Bcc: ${HANDLE}`,
        `Subject: ${subject}`,
        `Message-ID: <imap-draft-${randomUUID()}@acme.test>`,
        'Date: Mon, 10 Aug 2026 10:00:00 +0000',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        'IMAP draft body',
      ].join('\r\n'),
      ['\\Draft'],
    );
  } finally {
    await client.logout();
  }
};

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

    expect(
      await findPersistedMessages({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        subject,
      }),
    ).toEqual([
      expect.objectContaining({
        isDraft: false,
        messageThreadId: expect.any(String),
        text: 'SMTP reply body',
        messageChannelMessageAssociations: [
          expect.objectContaining({ messageChannelId }),
        ],
        messageParticipants: expect.arrayContaining([
          expect.objectContaining({ handle: HANDLE, role: 'TO' }),
          expect.objectContaining({ handle: HANDLE, role: 'CC' }),
          expect.objectContaining({ handle: HANDLE, role: 'BCC' }),
        ]),
      }),
    ]);
  }, 300000);

  it('sends a synced IMAP draft through GraphQL and replaces it in the database', async () => {
    const subject = `IMAP/SMTP draft ${randomUUID()}`;

    await appendDraft({ greenmail, subject });
    await runMessageChannelSync(messageChannelId);

    const [draft] = await findPersistedMessages({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      subject,
    });

    expect(draft).toEqual(
      expect.objectContaining({
        isDraft: true,
        messageChannelMessageAssociations: [
          expect.objectContaining({ messageChannelId }),
        ],
        messageParticipants: expect.arrayContaining([
          expect.objectContaining({ handle: HANDLE, role: 'TO' }),
          expect.objectContaining({ handle: HANDLE, role: 'CC' }),
          expect.objectContaining({ handle: HANDLE, role: 'BCC' }),
        ]),
      }),
    );

    const result = await sendEmail({
      connectedAccountId,
      to: HANDLE,
      cc: HANDLE,
      bcc: HANDLE,
      subject,
      body: '<p>SMTP draft body</p>',
      draftMessageId: draft.id,
    });

    expect(result).toMatchObject({ success: true });

    expect(
      await findPersistedMessages({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        subject,
      }),
    ).toEqual([
      expect.objectContaining({
        isDraft: false,
        messageThreadId: expect.any(String),
        text: 'SMTP draft body',
        messageChannelMessageAssociations: [
          expect.objectContaining({ messageChannelId }),
        ],
        messageParticipants: expect.arrayContaining([
          expect.objectContaining({ handle: HANDLE, role: 'TO' }),
          expect.objectContaining({ handle: HANDLE, role: 'CC' }),
          expect.objectContaining({ handle: HANDLE, role: 'BCC' }),
        ]),
      }),
    ]);
    expect(result.messageThreadId).toEqual(expect.any(String));
  }, 300000);
});
