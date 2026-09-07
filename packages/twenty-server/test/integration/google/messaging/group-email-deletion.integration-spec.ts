import { ConnectedAccountProvider } from 'twenty-shared/types';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { updateMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-group-email-deletion@apple.dev';

const MESSAGE_COUNT_ABOVE_DELETION_PAGE_SIZE = 600;
const ONE_IN_EVERY_N_MESSAGES_IS_A_GROUP_EMAIL = 100;

const isGroupEmailIndex = (index: number) =>
  index % ONE_IN_EVERY_N_MESSAGES_IS_A_GROUP_EMAIL === 0;

const messageExternalIdAt = (index: number) => `group-email-deletion-${index}`;
const subjectAt = (index: number) => `Subject ${messageExternalIdAt(index)}`;

const messageIndexes = Array.from(
  { length: MESSAGE_COUNT_ABOVE_DELETION_PAGE_SIZE },
  (_, index) => index,
);

const inbox = messageIndexes.map((index) =>
  gmailMessage({
    id: messageExternalIdAt(index),
    from: isGroupEmailIndex(index)
      ? `info@group-sender-${index}.com`
      : `person-${index}@example.com`,
  }),
);

const groupEmailSubjects = messageIndexes
  .filter(isGroupEmailIndex)
  .map(subjectAt);

const personalSubjects = messageIndexes
  .filter((index) => !isGroupEmailIndex(index))
  .map(subjectAt);

describe('Gmail group email deletion (integration)', () => {
  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let groupEmailSubjectsAfterCleanup: string[];
  let personalSubjectsAfterCleanup: string[];

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    await updateMessageChannel(channel.channelId, {
      excludeGroupEmails: true,
    });

    await runMessageChannelSync(channel.channelId);

    groupEmailSubjectsAfterCleanup =
      await findImportedMessageSubjects(groupEmailSubjects);
    personalSubjectsAfterCleanup =
      await findImportedMessageSubjects(personalSubjects);
  }, 600000);

  afterAll(async () => {
    jest.restoreAllMocks();
    await channel?.cleanup().catch(() => undefined);
  });

  it('removes every group email from a mailbox spanning more than one deletion page', () => {
    expect(groupEmailSubjectsAfterCleanup).toEqual([]);
  });

  it('keeps the messages sent by real people', () => {
    expect(personalSubjectsAfterCleanup).toEqual([...personalSubjects].sort());
  });
});
