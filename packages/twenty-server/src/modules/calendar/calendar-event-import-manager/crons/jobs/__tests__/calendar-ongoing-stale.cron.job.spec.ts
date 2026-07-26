import { In, IsNull, LessThan, Or, type Repository } from 'typeorm';

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

  let calendarChannelRepository: { find: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: CalendarOngoingStaleCronJob;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    calendarChannelRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-1' },
        ]),
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

  it('enqueues recovery once per workspace with a stale channel', async () => {
    await job.handle();

    expect(calendarChannelRepository.find).toHaveBeenCalledWith({
      select: {
        workspaceId: true,
      },
      where: {
        syncStage: In(CALENDAR_ONGOING_STALE_SYNC_STAGES),
        syncStageStartedAt: Or(
          IsNull(),
          LessThan(
            new Date(now.getTime() - CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT),
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
      CalendarOngoingStaleJob.name,
      {
        workspaceId: 'workspace-1',
      },
    );
  });
});
