import { In, IsNull, LessThan, Or, type Repository } from 'typeorm';

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

  let messageChannelRepository: { find: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: MessagingOngoingStaleCronJob;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    messageChannelRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-1' },
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('enqueues recovery once per workspace with a stale channel', async () => {
    await job.handle();

    expect(messageChannelRepository.find).toHaveBeenCalledWith({
      select: {
        workspaceId: true,
      },
      where: {
        syncStage: In(MESSAGING_ONGOING_STALE_SYNC_STAGES),
        syncStageStartedAt: Or(
          IsNull(),
          LessThan(
            new Date(now.getTime() - MESSAGING_IMPORT_ONGOING_SYNC_TIMEOUT),
          ),
        ),
        workspace: {
          deletedAt: IsNull(),
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      },
    });
    expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    expect(messageQueueService.add).toHaveBeenCalledWith(
      MessagingOngoingStaleJob.name,
      {
        workspaceId: 'workspace-1',
      },
    );
  });
});
