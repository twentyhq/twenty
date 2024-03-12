import { Injectable } from '@nestjs/common';

import { deleteUsingPagination } from 'src/workspace/calendar-and-messaging/utils/delete-using-pagination.util';
import { CalendarEventService } from 'src/workspace/calendar/repositories/calendar-event/calendar-event.service';

@Injectable()
export class CalendarEventCleanerService {
  constructor(private readonly calendarEventService: CalendarEventService) {}

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
