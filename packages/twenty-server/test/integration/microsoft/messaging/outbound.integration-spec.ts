import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { createCalendarEvent } from 'test/integration/utils/create-calendar-event.util';
import { findImportedCalendarEventTitles } from 'test/integration/utils/find-imported-records.util';
import { sendEmail } from 'test/integration/utils/send-email.util';

const HANDLE = 'microsoft-outbound@apple.dev';
const RECIPIENTS = {
  to: 'to-recipient@example.com',
  cc: 'cc-recipient@example.com',
  bcc: 'bcc-recipient@example.com',
};

describe('Microsoft outbound messaging and calendar creation (integration)', () => {
  const microsoft = setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let draftEmailTool: DraftEmailTool;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
    draftEmailTool =
      getAppProviderByClassName<DraftEmailTool>('DraftEmailTool');
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
  }, 60000);

  it('creates a Microsoft draft with the requested recipients', async () => {
    const subject = `Microsoft draft ${randomUUID()}`;

    const result = await draftEmailTool.execute(
      {
        connectedAccountId: channel.connectedAccountId,
        recipients: RECIPIENTS,
        subject,
        body: '<p>Microsoft draft body</p>',
        files: [],
      },
      { workspaceId: SEED_APPLE_WORKSPACE_ID },
    );

    expect(result.success).toBe(true);
    expect(microsoft.createdMessages).toEqual([
      expect.objectContaining({
        subject,
        toRecipients: [{ emailAddress: { address: RECIPIENTS.to } }],
        ccRecipients: [{ emailAddress: { address: RECIPIENTS.cc } }],
        bccRecipients: [{ emailAddress: { address: RECIPIENTS.bcc } }],
      }),
    ]);
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
