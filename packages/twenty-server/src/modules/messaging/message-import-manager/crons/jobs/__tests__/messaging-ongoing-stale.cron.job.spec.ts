import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';
import { MessagingOngoingStaleJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

describe('MessagingOngoingStaleCronJob', () => {
  let messageChannelRepository: { find: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: MessagingOngoingStaleCronJob;

  beforeEach(async () => {
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

    const module = await Test.createTestingModule({
      providers: [
        MessagingOngoingStaleCronJob,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
        {
          provide: getQueueToken(MessageQueue.messagingQueue),
          useValue: messageQueueService,
        },
        {
          provide: ExceptionHandlerService,
          useValue: { captureExceptions: jest.fn() },
        },
      ],
    }).compile();

    job = module.get(MessagingOngoingStaleCronJob);
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
        isWorkspaceJob: true,
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
        isWorkspaceJob: true,
      },
    );
  });

  it('does not enqueue recovery when no workspace has a stale channel', async () => {
    messageChannelRepository.find.mockResolvedValue([]);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
