import { Scope } from '@nestjs/common';



import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type CalendarEventListFetchJobData = {
  calendarChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventListFetchJob {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
    private readonly calendarFetchEventsService: CalendarFetchEventsService,
  ) {}

  @Process(CalendarEventListFetchJob.name)
  async handle(data: CalendarEventListFetchJobData): Promise<void> {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarChannel = await this.calendarChannelRepository.findOne(
          workspaceId,
          {
            where: {
              id: calendarChannelId,
              isSyncEnabled: true,
            },
            relations: ['connectedAccount'],
          },
        );

        if (!calendarChannel) {
          return;
        }

        if (
          calendarChannel.syncStage !==
          CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED
        ) {
          return;
        }

        await this.calendarFetchEventsService.fetchCalendarEvents(
          calendarChannel as unknown as CalendarChannelEntity,
          calendarChannel.connectedAccount,
          workspaceId,
        );
      },
      authContext,
      { lite: true },
    );
  }
}
