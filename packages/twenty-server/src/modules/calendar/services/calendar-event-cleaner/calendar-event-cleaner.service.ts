import { Injectable } from '@nestjs/common';

import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event/calendar-event.repository';
import { deleteUsingPagination } from 'src/modules/messaging/services/thread-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  constructor(private readonly calendarEventService: CalendarEventRepository) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      this.calendarEventService.getNonAssociatedCalendarEventIdsPaginated.bind(
        this.calendarEventService,
      ),
      this.calendarEventService.deleteByIds.bind(this.calendarEventService),
    );
  }
}
