import { type Repository } from 'typeorm';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { CalendarOngoingStaleJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-ongoing-stale.job';

describe('CalendarOngoingStaleCronJob', () => {
  let calendarChannelRepository: { find: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: CalendarOngoingStaleCronJob;

  beforeEach(() => {
    calendarChannelRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-1' },
          { workspaceId: 'workspace-2' },
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

  it('enqueues recovery once per workspace with a stale channel', async () => {
    await job.handle();

    expect(messageQueueService.add).toHaveBeenCalledTimes(2);
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      1,
      CalendarOngoingStaleJob.name,
      {
        workspaceId: 'workspace-1',
      },
    );
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      2,
      CalendarOngoingStaleJob.name,
      {
        workspaceId: 'workspace-2',
      },
    );
  });

  it('does not enqueue recovery when no workspace has a stale channel', async () => {
    calendarChannelRepository.find.mockResolvedValue([]);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
