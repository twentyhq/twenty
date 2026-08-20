import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { createCalendarEvent } from 'test/integration/utils/create-calendar-event.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { sendEmail } from 'test/integration/utils/send-email.util';

const HANDLE = 'microsoft-outbound@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};
const DRAFT_SUBJECT = `Microsoft draft ${randomUUID()}`;
const DRAFT_MESSAGE = {
  id: 'microsoft-draft-message',
  subject: DRAFT_SUBJECT,
  body: { contentType: 'text', content: 'Microsoft draft body' },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: '<microsoft-draft@example.com>',
  conversationId: 'microsoft-draft-conversation',
  parentFolderId: 'drafts',
  isDraft: true,
  from: { emailAddress: { address: HANDLE } },
  toRecipients: [{ emailAddress: { address: RECIPIENTS.to } }],
  ccRecipients: [{ emailAddress: { address: RECIPIENTS.cc } }],
  bccRecipients: [{ emailAddress: { address: RECIPIENTS.bcc } }],
};

describe('Microsoft outbound messaging and calendar creation (integration)', () => {
  const microsoft = setupMicrosoftMock({
    handle: HANDLE,
    folders: [
      { id: 'inbox', displayName: 'Inbox' },
      { id: 'sentitems', displayName: 'Sent Items' },
      { id: 'drafts', displayName: 'Drafts' },
    ],
    messages: [DRAFT_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
    await runMessageChannelSync(channel.channelId);
  }, 60000);

  beforeEach(() => {
    microsoft.createdMessages.length = 0;
    microsoft.patchedMessages.length = 0;
    microsoft.sentMessageIds.length = 0;
    microsoft.createdCalendarEvents.length = 0;
  });

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('sends a reply through Graph with To, CC, and BCC recipients', async () => {
    const subject = `Microsoft outbound ${randomUUID()}`;

    const result = await sendEmail({
      connectedAccountId: channel.connectedAccountId,
      to: RECIPIENTS.to,
      cc: RECIPIENTS.cc,
      bcc: RECIPIENTS.bcc,
      subject,
      body: '<p>Microsoft reply body</p>',
      inReplyTo: '<microsoft-parent@example.com>',
    });

    expect(result).toMatchObject({ success: true });
    expect(microsoft.patchedMessages).toEqual([
      expect.objectContaining({
        subject,
        toRecipients: [{ emailAddress: { address: RECIPIENTS.to } }],
        ccRecipients: [{ emailAddress: { address: RECIPIENTS.cc } }],
        bccRecipients: [{ emailAddress: { address: RECIPIENTS.bcc } }],
      }),
    ]);
    expect(microsoft.sentMessageIds).toEqual(['microsoft-reply-message']);
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
      text: 'Microsoft reply body',
    });
    expect(
      await findRecordNodesByFilter<{
        messageChannelId: string;
        messageExternalId: string;
      }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId messageExternalId',
        { messageId: { eq: message.id } },
      ),
    ).toEqual([
      expect.objectContaining({
        messageChannelId: channel.channelId,
        messageExternalId: 'microsoft-reply-message',
      }),
    ]);
    expect(
      await findRecordNodesByFilter<{ handle: string; role: string }>(
        'messageParticipant',
        'messageParticipants',
        'handle role',
        { messageId: { eq: message.id } },
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ handle: RECIPIENTS.to, role: 'TO' }),
        expect.objectContaining({ handle: RECIPIENTS.cc, role: 'CC' }),
        expect.objectContaining({ handle: RECIPIENTS.bcc, role: 'BCC' }),
      ]),
    );
  }, 60000);

  it('sends a synced Microsoft draft through GraphQL and replaces it in the database', async () => {
    const [draft] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
    }>('message', 'messages', 'id isDraft', {
      subject: { eq: DRAFT_SUBJECT },
    });

    expect(draft).toMatchObject({
      isDraft: true,
    });
    expect(
      await findRecordNodesByFilter<{
        messageChannelId: string;
        messageExternalId: string;
      }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId messageExternalId',
        { messageId: { eq: draft.id } },
      ),
    ).toEqual([
      expect.objectContaining({
        messageChannelId: channel.channelId,
        messageExternalId: DRAFT_MESSAGE.id,
      }),
    ]);
    expect(
      await findRecordNodesByFilter<{ handle: string; role: string }>(
        'messageParticipant',
        'messageParticipants',
        'handle role',
        { messageId: { eq: draft.id } },
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ handle: RECIPIENTS.to, role: 'TO' }),
        expect.objectContaining({ handle: RECIPIENTS.cc, role: 'CC' }),
        expect.objectContaining({ handle: RECIPIENTS.bcc, role: 'BCC' }),
      ]),
    );

    const result = await sendEmail({
      connectedAccountId: channel.connectedAccountId,
      to: RECIPIENTS.to,
      cc: RECIPIENTS.cc,
      bcc: RECIPIENTS.bcc,
      subject: DRAFT_SUBJECT,
      body: 'Microsoft draft body',
      draftMessageId: draft.id,
    });

    expect(result).toMatchObject({ success: true });
    expect(microsoft.createdMessages).toEqual([
      expect.objectContaining({
        subject: DRAFT_SUBJECT,
        toRecipients: [{ emailAddress: { address: RECIPIENTS.to } }],
        ccRecipients: [{ emailAddress: { address: RECIPIENTS.cc } }],
        bccRecipients: [{ emailAddress: { address: RECIPIENTS.bcc } }],
      }),
    ]);
    expect(microsoft.sentMessageIds).toEqual(['microsoft-message-1']);
    const [sentMessage] = await findRecordNodesByFilter<{
      id: string;
      isDraft: boolean;
      messageThreadId: string | null;
      text: string | null;
    }>('message', 'messages', 'id isDraft messageThreadId text', {
      subject: { eq: DRAFT_SUBJECT },
    });

    expect(sentMessage).toMatchObject({
      isDraft: false,
      messageThreadId: expect.any(String),
      text: 'Microsoft draft body',
    });
    expect(
      await findRecordNodesByFilter<{
        messageChannelId: string;
        messageExternalId: string;
      }>(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        'messageChannelId messageExternalId',
        { messageId: { eq: sentMessage.id } },
      ),
    ).toEqual([
      expect.objectContaining({
        messageChannelId: channel.channelId,
        messageExternalId: 'microsoft-message-1',
      }),
    ]);
    expect(result.messageThreadId).toEqual(expect.any(String));
  }, 60000);

  it('creates and persists a calendar event with invitations and conferencing', async () => {
    const title = `Microsoft calendar outbound ${randomUUID()}`;

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
    expect(result.iCalUid).toContain('@microsoft.com');
    expect(microsoft.createdCalendarEvents).toEqual([
      expect.objectContaining({
        subject: title,
        location: { displayName: 'Room 101' },
        attendees: [
          {
            emailAddress: { address: RECIPIENTS.to },
            type: 'required',
          },
        ],
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      }),
    ]);
    expect(await findImportedCalendarEventTitles([title])).toEqual([title]);
  }, 60000);
});
