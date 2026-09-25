import { Scope } from '@nestjs/common';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type CalendarEventsImportJobData = {
  calendarChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventsImportJob {
  constructor(
    private readonly calendarEventsImportService: CalendarEventsImportService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
  ) {}

  @Process(CalendarEventsImportJob.name)
  async handle(data: CalendarEventsImportJobData): Promise<void> {
    const { calendarChannelId, workspaceId } = data;

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

        if (!calendarChannel?.isSyncEnabled) {
          return;
        }

        if (
          calendarChannel.syncStage !==
          CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED
        ) {
          return;
        }

        await this.calendarEventsImportService.processCalendarEventsImport(
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
