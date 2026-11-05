import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarOngoingStaleCronJob } from 'src/modules/calendar/calendar-event-import-manager/crons/jobs/calendar-ongoing-stale.cron.job';
import { CalendarOngoingStaleJob } from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-ongoing-stale.job';

describe('CalendarOngoingStaleCronJob', () => {
  let calendarChannelRepository: { find: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let job: CalendarOngoingStaleCronJob;

  beforeEach(async () => {
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

    const module = await Test.createTestingModule({
      providers: [
        CalendarOngoingStaleCronJob,
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: calendarChannelRepository,
        },
        {
          provide: getQueueToken(MessageQueue.calendarQueue),
          useValue: messageQueueService,
        },
        {
          provide: ExceptionHandlerService,
          useValue: { captureExceptions: jest.fn() },
        },
      ],
    }).compile();

    job = module.get(CalendarOngoingStaleCronJob);
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
      {
        workspaceId: 'workspace-1',
        isWorkspaceJob: true,
      },
    );
    expect(messageQueueService.add).toHaveBeenNthCalledWith(
      2,
      CalendarOngoingStaleJob.name,
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
    calendarChannelRepository.find.mockResolvedValue([]);

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
