import { Injectable } from '@nestjs/common';

import { Any, IsNull } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const calendarEventRepository =
      await this.twentyORMManager.getRepository('calendarEvent');

    await deleteUsingPagination(
      workspaceId,
      500,
      async (limit, offset) => {
        const nonAssociatedCalendarEvents = await calendarEventRepository.find({
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
        await calendarEventRepository.delete({ id: Any(ids) });
      },
    );
  }
}
