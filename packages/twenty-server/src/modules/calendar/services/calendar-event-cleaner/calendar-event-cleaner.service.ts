import { Injectable } from '@nestjs/common';

import { Any, IsNull } from 'typeorm';

import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  constructor(
    @InjectWorkspaceRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: WorkspaceRepository<CalendarEventWorkspaceEntity>,
  ) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      async (limit, offset) => {
        const nonAssociatedCalendarEvents =
          await this.calendarEventRepository.find({
            where: {
              calendarChannelEventAssociations: {
                id: IsNull(),
              },
            },
            take: limit,
            skip: offset,
          });

        return nonAssociatedCalendarEvents.map(({ id }) => id);
      },
      async (ids) => {
        await this.calendarEventRepository.delete({ id: Any(ids) });
      },
    );
  }
}
