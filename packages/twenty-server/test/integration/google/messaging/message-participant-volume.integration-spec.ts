import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-participant-volume@apple.dev';

const MESSAGE_COUNT = 30;

const senderHandles = Array.from(
  { length: MESSAGE_COUNT },
  () => `sender-${randomUUID()}@acme.dev`,
);

const inbox = senderHandles.map((from) => gmailMessage({ from, to: HANDLE }));

describe('Message participant saving at volume (integration)', () => {
  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('persists a distinct sender participant for every imported message with the right handle and role', async () => {
    const fromParticipants = await findRecordNodesByFilter<{
      handle: string;
      role: string;
      messageId: string;
    }>('messageParticipant', 'messageParticipants', 'handle role messageId', {
      handle: { in: senderHandles },
    });

    expect(fromParticipants).toHaveLength(MESSAGE_COUNT);
    expect(
      fromParticipants.every(
        (participant) => participant.role === MessageParticipantRole.FROM,
      ),
    ).toBe(true);
    expect(
      new Set(fromParticipants.map((participant) => participant.handle)).size,
    ).toBe(MESSAGE_COUNT);
    expect(
      new Set(fromParticipants.map((participant) => participant.messageId))
        .size,
    ).toBe(MESSAGE_COUNT);
  }, 120000);

  it('links every message to its own recipient participant row instead of collapsing on the shared handle', async () => {
    const toParticipants = await findRecordNodesByFilter<{
      role: string;
      messageId: string;
    }>('messageParticipant', 'messageParticipants', 'role messageId', {
      handle: { eq: HANDLE },
      role: { eq: MessageParticipantRole.TO },
    });

    expect(toParticipants).toHaveLength(MESSAGE_COUNT);
    expect(
      new Set(toParticipants.map((participant) => participant.messageId)).size,
    ).toBe(MESSAGE_COUNT);
  }, 120000);
});
