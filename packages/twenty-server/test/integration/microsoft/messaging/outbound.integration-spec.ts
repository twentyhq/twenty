import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { createCalendarEvent } from 'test/integration/utils/create-calendar-event.util';
import { findPersistedMessages } from 'test/integration/utils/find-persisted-messages.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
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
    expect(
      await findPersistedMessages({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        subject,
      }),
    ).toEqual([
      expect.objectContaining({
        isDraft: false,
        messageThreadId: expect.any(String),
        text: 'Microsoft reply body',
        messageChannelMessageAssociations: [
          expect.objectContaining({
            messageChannelId: channel.channelId,
            messageExternalId: 'microsoft-reply-message',
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

  it('sends a synced Microsoft draft through GraphQL and replaces it in the database', async () => {
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
    expect(
      await findPersistedMessages({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        subject: DRAFT_SUBJECT,
      }),
    ).toEqual([
      expect.objectContaining({
        isDraft: false,
        messageThreadId: expect.any(String),
        text: 'Microsoft draft body',
        messageChannelMessageAssociations: [
          expect.objectContaining({
            messageChannelId: channel.channelId,
            messageExternalId: 'microsoft-message-1',
          }),
        ],
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
