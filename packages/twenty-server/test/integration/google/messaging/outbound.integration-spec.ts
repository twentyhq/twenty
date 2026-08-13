import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { createCalendarEvent } from 'test/integration/utils/create-calendar-event.util';
import { findPersistedMessages } from 'test/integration/utils/find-persisted-messages.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { sendEmail } from 'test/integration/utils/send-email.util';

const HANDLE = 'gmail-outbound@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};
const PARENT_MESSAGE = gmailMessage({
  id: 'gmail-parent',
  threadId: 'gmail-parent-thread',
  to: HANDLE,
});
const DRAFT_SUBJECT = `Gmail draft ${randomUUID()}`;
const DRAFT_MESSAGE = gmailMessage({
  id: 'gmail-draft-message',
  threadId: 'gmail-draft-thread',
  from: HANDLE,
  to: RECIPIENTS.to,
  labelIds: ['DRAFT'],
  payload: {
    mimeType: 'text/plain',
    headers: [
      { name: 'From', value: HANDLE },
      { name: 'To', value: RECIPIENTS.to },
      { name: 'Cc', value: RECIPIENTS.cc },
      { name: 'Bcc', value: RECIPIENTS.bcc },
      { name: 'Subject', value: DRAFT_SUBJECT },
      { name: 'Message-ID', value: '<gmail-draft@example.com>' },
      { name: 'Date', value: 'Wed, 15 Nov 2023 00:00:00 +0000' },
    ],
    body: {
      data: Buffer.from('Gmail draft body').toString('base64'),
      size: 16,
    },
  },
});

describe('Gmail outbound messaging and calendar creation (integration)', () => {
  const google = setupGoogleMock({
    handle: HANDLE,
    inbox: [PARENT_MESSAGE, DRAFT_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
    await runMessageChannelSync(channel.channelId);
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('sends a reply with recipients and RFC 5322 threading headers', async () => {
    const subject = `Gmail outbound ${randomUUID()}`;

    const result = await sendEmail({
      connectedAccountId: channel.connectedAccountId,
      to: RECIPIENTS.to,
      cc: RECIPIENTS.cc,
      bcc: RECIPIENTS.bcc,
      subject,
      body: '<p>Gmail reply body</p>',
      inReplyTo: '<gmail-parent@example.com>',
    });

    expect(result).toMatchObject({ success: true });
    expect(google.sentMessages).toHaveLength(1);

    const [{ raw, threadId }] = google.sentMessages;

    expect(threadId).toBe(PARENT_MESSAGE.threadId);
    expect(raw).toContain(`To: ${RECIPIENTS.to}`);
    expect(raw).toContain(`Cc: ${RECIPIENTS.cc}`);
    expect(raw).toContain(`Bcc: ${RECIPIENTS.bcc}`);
    expect(raw).toContain(`Subject: ${subject}`);
    expect(raw).toContain('In-Reply-To: <gmail-parent@example.com>');
    expect(raw).toContain('References: <gmail-parent@example.com>');

    expect(
      await findPersistedMessages({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        subject,
      }),
    ).toEqual([
      expect.objectContaining({
        isDraft: false,
        messageThreadId: expect.any(String),
        text: 'Gmail reply body',
        messageChannelMessageAssociations: [
          expect.objectContaining({
            messageChannelId: channel.channelId,
          }),
        ],
        messageParticipants: expect.arrayContaining([
          expect.objectContaining({ handle: RECIPIENTS.to, role: 'TO' }),
          expect.objectContaining({ handle: RECIPIENTS.cc, role: 'CC' }),
          expect.objectContaining({ handle: RECIPIENTS.bcc, role: 'BCC' }),
        ]),
      }),
    ]);
  }, 60000);

  it('sends a synced Gmail draft through GraphQL and replaces it in the database', async () => {
    const [draft] = await findPersistedMessages({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      subject: DRAFT_SUBJECT,
    });

    expect(draft).toMatchObject({
      isDraft: true,
      messageChannelMessageAssociations: [
        expect.objectContaining({
          messageChannelId: channel.channelId,
          messageExternalId: DRAFT_MESSAGE.id,
        }),
      ],
      messageParticipants: expect.arrayContaining([
        expect.objectContaining({ handle: RECIPIENTS.to, role: 'TO' }),
        expect.objectContaining({ handle: RECIPIENTS.cc, role: 'CC' }),
        expect.objectContaining({ handle: RECIPIENTS.bcc, role: 'BCC' }),
      ]),
    });

    const result = await sendEmail({
      connectedAccountId: channel.connectedAccountId,
      to: RECIPIENTS.to,
      cc: RECIPIENTS.cc,
      bcc: RECIPIENTS.bcc,
      subject: DRAFT_SUBJECT,
      body: 'Gmail draft body',
      draftMessageId: draft.id,
    });

    expect(result).toMatchObject({ success: true });
    const [sentMessage] = await findPersistedMessages({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      subject: DRAFT_SUBJECT,
    });

    expect(sentMessage).toEqual(
      expect.objectContaining({
        isDraft: false,
        messageThreadId: expect.any(String),
        text: 'Gmail draft body',
        messageChannelMessageAssociations: [
          expect.objectContaining({
            messageChannelId: channel.channelId,
            messageExternalId: expect.any(String),
          }),
        ],
      }),
    );
    expect(
      sentMessage.messageChannelMessageAssociations[0].messageExternalId,
    ).not.toBe(DRAFT_MESSAGE.id);
    expect(result.messageThreadId).toEqual(expect.any(String));
  }, 60000);

  it('creates and persists a calendar event with invitations and conferencing', async () => {
    const title = `Google calendar outbound ${randomUUID()}`;

    const result = await createCalendarEvent({
      connectedAccountId: channel.connectedAccountId,
      title,
      description: 'Planning meeting',
      location: 'Room 101',
      startsAt: '2026-08-13T09:00:00Z',
      endsAt: '2026-08-13T10:00:00Z',
      timeZone: 'UTC',
      attendees: RECIPIENTS.to,
      sendInvitations: true,
      addConferencing: true,
    });

    expect(result).toMatchObject({ success: true });
    expect(result.iCalUid).toContain('@google.com');
    expect(google.createdCalendarEvents).toEqual([
      expect.objectContaining({
        summary: title,
        attendees: [expect.objectContaining({ email: RECIPIENTS.to })],
        conferenceData: expect.objectContaining({
          createRequest: expect.any(Object),
        }),
      }),
    ]);
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);
  }, 60000);
});
