import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { disconnectConnectedAccount } from 'test/integration/utils/query-messaging.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-disconnection@apple.dev';

describe('Messaging connected account disconnection (integration)', () => {
  const inbox = [gmailMessage()];
  const expectedSubject = getGmailMessageSubject(inbox[0]);

  setupGoogleMock({ handle: HANDLE, inbox });

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

  it('keeps synced data while archiving the account and pausing its channels', async () => {
    expect(await findImportedMessageSubjects([expectedSubject])).toEqual([
      expectedSubject,
    ]);

    await disconnectConnectedAccount(channel.connectedAccountId);

    const [connectedAccount, messageChannel, calendarChannel] =
      await Promise.all([
        getCoreRepository<ConnectedAccountEntity>(
          ConnectedAccountEntity,
        ).findOneByOrFail({ id: channel.connectedAccountId }),
        getCoreRepository<MessageChannelEntity>(
          MessageChannelEntity,
        ).findOneByOrFail({ id: channel.channelId }),
        getCoreRepository<CalendarChannelEntity>(
          CalendarChannelEntity,
        ).findOneByOrFail({ id: channel.calendarChannelId }),
      ]);

    expect(connectedAccount.archivedAt).not.toBeNull();
    expect(connectedAccount.accessToken).toBeNull();
    expect(connectedAccount.refreshToken).toBeNull();
    expect(messageChannel.isSyncEnabled).toBe(false);
    expect(calendarChannel.isSyncEnabled).toBe(false);
    expect(await findImportedMessageSubjects([expectedSubject])).toEqual([
      expectedSubject,
    ]);
  }, 60000);

  it('restores the same account and its data after OAuth reconnect', async () => {
    const reconnectedChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    expect(reconnectedChannel.connectedAccountId).toBe(
      channel.connectedAccountId,
    );
    expect(reconnectedChannel.channelId).toBe(channel.channelId);
    expect(reconnectedChannel.calendarChannelId).toBe(
      channel.calendarChannelId,
    );

    const [connectedAccount, messageChannel, calendarChannel] =
      await Promise.all([
        getCoreRepository<ConnectedAccountEntity>(
          ConnectedAccountEntity,
        ).findOneByOrFail({ id: channel.connectedAccountId }),
        getCoreRepository<MessageChannelEntity>(
          MessageChannelEntity,
        ).findOneByOrFail({ id: channel.channelId }),
        getCoreRepository<CalendarChannelEntity>(
          CalendarChannelEntity,
        ).findOneByOrFail({ id: channel.calendarChannelId }),
      ]);

    expect(connectedAccount.archivedAt).toBeNull();
    expect(messageChannel.isSyncEnabled).toBe(true);
    expect(calendarChannel.isSyncEnabled).toBe(true);
    expect(await findImportedMessageSubjects([expectedSubject])).toEqual([
      expectedSubject,
    ]);
  }, 60000);
});
