import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type Repository } from 'typeorm';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';
import { MessagingOngoingStaleJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

describe('MessagingOngoingStaleCronJob', () => {
  let messageChannelRepository: { find: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: MessagingOngoingStaleCronJob;

  beforeEach(() => {
    messageChannelRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-2' },
        ]),
    };
    messageQueueService = { add: jest.fn() };
    job = new MessagingOngoingStaleCronJob(
      messageChannelRepository as unknown as Repository<MessageChannelEntity>,
      messageQueueService as unknown as MessageQueueService,
      {
        captureExceptions: jest.fn(),
      } as unknown as ExceptionHandlerService,
    );
  });

  it('enqueues recovery once per workspace with a stale channel', async () => {
    await job.handle();

    expect(messageQueueService.add).toHaveBeenCalledTimes(2);
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      1,
      MessagingOngoingStaleJob.name,
      {
        workspaceId: 'workspace-1',
      },
      {
        workspaceId: 'workspace-1',
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    );
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      2,
      MessagingOngoingStaleJob.name,
      {
        workspaceId: 'workspace-2',
      },
      {
        workspaceId: 'workspace-2',
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    );
  });

  it('does not enqueue recovery when no workspace has a stale channel', async () => {
    messageChannelRepository.find.mockResolvedValue([]);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
