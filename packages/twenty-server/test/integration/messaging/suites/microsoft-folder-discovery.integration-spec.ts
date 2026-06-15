import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { setupMicrosoftMock } from 'test/integration/messaging/utils/microsoft-message-mock.util';
import { queryMessageFolders } from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueJob } from 'test/integration/utils/enqueue-job.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'microsoft-folder-discovery@apple.dev';

describe('Microsoft folder discovery (integration)', () => {
  setupMicrosoftMock({ inbox: [], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const getFolderNames = async (): Promise<string[]> => {
    const folders = await queryMessageFolders(channel.channelId);

    return folders
      .map((folder) => folder.name)
      .filter((name): name is string => name !== null)
      .sort();
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('discovers Microsoft mail folders through the Graph delta sync', async () => {
    await enqueueJob(
      MessageQueue.cronQueue,
      MessagingMessageListFetchCronJob,
      {},
    );

    const folderNames = await pollUntil(
      getFolderNames,
      (names) => names.length === 2,
    );

    expect(folderNames).toEqual(['Inbox', 'Sent Items']);
  }, 60000);
});
