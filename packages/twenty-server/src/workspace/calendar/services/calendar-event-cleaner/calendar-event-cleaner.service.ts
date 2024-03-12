import { Injectable } from '@nestjs/common';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { CalendarEventService } from 'src/workspace/calendar/repositories/calendar-event/calendar-event.service';

@Injectable()
export class CalendarEventCleanerService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly calendarEventService: CalendarEventService,
  ) {}

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.transaction(async (transactionManager) => {
      const calendarEventsToDelete = await this.calendarEventService
        .getNonAssociatedCalendarEvents
        // workspaceId,
        // transactionManager,
        ();

      const calendarEventIdsToDelete = calendarEventsToDelete.map(
        ({ id }) => id,
      );

      if (calendarEventIdsToDelete.length > 0) {
        await this.calendarEventService.deleteByIds(
          calendarEventIdsToDelete,
          workspaceId,
          transactionManager,
        );
      }
    });
  }
}
