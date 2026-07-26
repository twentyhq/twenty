import { type Repository } from 'typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-import-ongoing-sync-timeout.constant';
import {
  CALENDAR_ONGOING_STALE_SYNC_STAGES,
  CalendarOngoingStaleJob,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-ongoing-stale.job';

describe('CalendarOngoingStaleCronJob', () => {
  const now = new Date('2026-07-26T12:00:00.000Z');

  let queryBuilder: {
    innerJoin: jest.Mock;
    select: jest.Mock;
    distinct: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getRawMany: jest.Mock;
  };
  let calendarChannelRepository: { createQueryBuilder: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: CalendarOngoingStaleCronJob;

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
    calendarChannelRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    messageQueueService = { add: jest.fn() };
    job = new CalendarOngoingStaleCronJob(
      calendarChannelRepository as unknown as Repository<CalendarChannelEntity>,
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

    expect(calendarChannelRepository.createQueryBuilder).toHaveBeenCalledWith(
      'calendarChannel',
    );
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'calendarChannel.workspace',
      'workspace',
    );
    expect(queryBuilder.select).toHaveBeenCalledWith(
      'calendarChannel.workspaceId',
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
      'calendarChannel.syncStage IN (:...syncStages)',
      {
        syncStages: CALENDAR_ONGOING_STALE_SYNC_STAGES,
      },
    );
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
      3,
      '(calendarChannel.syncStageStartedAt IS NULL OR calendarChannel.syncStageStartedAt < :staleBefore)',
      {
        staleBefore: new Date(
          now.getTime() - CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT,
        ),
      },
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      CalendarOngoingStaleJob.name,
      {
        workspaceId: 'workspace-1',
      },
    );
  });
});
