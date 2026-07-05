import { ConnectedAccountProvider } from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { queryMessageFolders } from 'test/integration/messaging/utils/query-messaging.util';
import { setupMicrosoftMock } from 'test/integration/mocks/microsoft/setup-microsoft-mock.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-folder-discovery@apple.dev';

describe('Microsoft folder discovery (integration)', () => {
  setupMicrosoftMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('discovers Microsoft mail folders through the Graph delta sync', async () => {
    await runMessageChannelSync(channel.channelId);

    const folders = await queryMessageFolders(channel.channelId);

    expect(folders.map((folder) => folder.name).sort()).toEqual([
      'Inbox',
      'Sent Items',
    ]);
  }, 60000);
});
