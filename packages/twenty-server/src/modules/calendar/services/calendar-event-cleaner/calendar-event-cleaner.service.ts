import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event.repository';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { deleteUsingPagination } from 'src/modules/messaging/message-cleaner/utils/delete-using-pagination.util';

@Injectable()
export class CalendarEventCleanerService {
  constructor(
    @InjectObjectMetadataRepository(CalendarEventWorkspaceEntity)
    private readonly calendarEventRepository: CalendarEventRepository,
  ) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    await deleteUsingPagination(
      workspaceId,
      500,
      this.calendarEventRepository.getNonAssociatedCalendarEventIdsPaginated.bind(
        this.calendarEventRepository,
      ),
      this.calendarEventRepository.deleteByIds.bind(
        this.calendarEventRepository,
      ),
    );
  }
}
