import { type Repository } from 'typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';
import { MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/message-import-manager/constants/messaging-import-ongoing-sync-timeout.constant';
import {
  MESSAGING_ONGOING_STALE_SYNC_STAGES,
  MessagingOngoingStaleJob,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-ongoing-stale.job';

describe('MessagingOngoingStaleCronJob', () => {
  const now = new Date('2026-07-26T12:00:00.000Z');

  let queryBuilder: {
    innerJoin: jest.Mock;
    select: jest.Mock;
    distinct: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getRawMany: jest.Mock;
  };
  let messageChannelRepository: { createQueryBuilder: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: MessagingOngoingStaleCronJob;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ workspaceId: 'workspace-1' }]),
    };
    messageChannelRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('enqueues recovery only for active workspaces with a stale channel', async () => {
    await job.handle();

    expect(messageChannelRepository.createQueryBuilder).toHaveBeenCalledWith(
      'messageChannel',
    );
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'messageChannel.workspace',
      'workspace',
    );
    expect(queryBuilder.select).toHaveBeenCalledWith(
      'messageChannel.workspaceId',
      'workspaceId',
    );
    expect(queryBuilder.distinct).toHaveBeenCalledWith(true);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'workspace.activationStatus = :activationStatus',
      {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      1,
      'workspace.deletedAt IS NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      2,
      'messageChannel.syncStage IN (:...syncStages)',
      {
        syncStages: MESSAGING_ONGOING_STALE_SYNC_STAGES,
      },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      3,
      '(messageChannel.syncStageStartedAt IS NULL OR messageChannel.syncStageStartedAt < :staleBefore)',
      {
        staleBefore: new Date(
          now.getTime() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT,
        ),
      },
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      MessagingOngoingStaleJob.name,
      {
        workspaceId: 'workspace-1',
      },
    );
  });
});
