import { type Repository } from 'typeorm';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';
import { MessagingOngoingStaleJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

const createQueryBuilderMock = (rawResult: Array<{ workspaceId: string }>) => ({
  select: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue(rawResult),
});

describe('MessagingOngoingStaleCronJob', () => {
  let messageChannelRepository: { createQueryBuilder: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: MessagingOngoingStaleCronJob;

  const mockQueryResult = (rawResult: Array<{ workspaceId: string }>) => {
    const queryBuilder = createQueryBuilderMock(rawResult);

    messageChannelRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    return queryBuilder;
  };

  beforeEach(() => {
    messageChannelRepository = { createQueryBuilder: jest.fn() };
    mockQueryResult([
      { workspaceId: 'workspace-1' },
      { workspaceId: 'workspace-1' },
      { workspaceId: 'workspace-2' },
    ]);
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
    );
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      2,
      MessagingOngoingStaleJob.name,
      {
        workspaceId: 'workspace-2',
      },
    );
  });

  it('does not enqueue recovery when no workspace has a stale channel', async () => {
    mockQueryResult([]);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('builds the query against the messageChannel/workspace join', async () => {
    const queryBuilder = mockQueryResult([]);

    await job.handle();

    expect(messageChannelRepository.createQueryBuilder).toHaveBeenCalledWith(
      'messageChannel',
    );
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'messageChannel.workspace',
      'workspace',
    );
  });
});
