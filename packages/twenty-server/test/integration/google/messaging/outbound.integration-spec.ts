import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { createCalendarEvent } from 'test/integration/utils/create-calendar-event.util';
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

describe('Gmail outbound messaging and calendar creation (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE, inbox: [PARENT_MESSAGE] });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let draftEmailTool: DraftEmailTool;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
    draftEmailTool =
      getAppProviderByClassName<DraftEmailTool>('DraftEmailTool');
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
  }, 60000);

  it('creates a Gmail draft with the requested recipients', async () => {
    const subject = `Gmail draft ${randomUUID()}`;

    const result = await draftEmailTool.execute(
      {
        connectedAccountId: channel.connectedAccountId,
        recipients: RECIPIENTS,
        subject,
        body: '<p>Gmail draft body</p>',
        files: [],
      },
      { workspaceId: SEED_APPLE_WORKSPACE_ID },
    );

    expect(result.success).toBe(true);
    expect(google.draftMessages).toHaveLength(1);

    const [{ raw }] = google.draftMessages;

    expect(raw).toContain(`To: ${RECIPIENTS.to}`);
    expect(raw).toContain(`Cc: ${RECIPIENTS.cc}`);
    expect(raw).toContain(`Bcc: ${RECIPIENTS.bcc}`);
    expect(raw).toContain(`Subject: ${subject}`);
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
