import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { CalendarEventAttendeeObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';

@Injectable()
export class CalendarEventAttendeesService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByIds(
    calendarEventAttendeeIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarEventAttendeeObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEventAttendees" WHERE "id" = ANY($1)`,
      [calendarEventAttendeeIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    calendarEventAttendeeIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarEventAttendees" WHERE "id" = ANY($1)`,
      [calendarEventAttendeeIds],
      workspaceId,
      transactionManager,
    );
  }
}
