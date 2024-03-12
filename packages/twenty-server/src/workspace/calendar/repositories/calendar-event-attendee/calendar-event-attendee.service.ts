import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { CalendarEventAttendeeObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';
import { valuesStringForBatchRawQuery } from 'src/workspace/calendar-and-messaging/utils/valueStringForBatchRawQuery.util';
import { CalendarEventAttendee } from 'src/workspace/calendar/types/calendar-event';

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

  public async saveCalendarEventAttendees(
    calendarEventAttendees: CalendarEventAttendee[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (calendarEventAttendees.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const valuesString = valuesStringForBatchRawQuery(
      calendarEventAttendees,
      5,
    );

    const values = calendarEventAttendees.flatMap((calendarEventAttendee) => [
      calendarEventAttendee.calendarEventId,
      calendarEventAttendee.handle,
      calendarEventAttendee.displayName,
      calendarEventAttendee.isOrganizer,
      calendarEventAttendee.responseStatus,
    ]);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarEventAttendee" ("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus") VALUES ${valuesString}`,
      values,
      workspaceId,
      transactionManager,
    );
  }

  public async updateCalendarEventAttendees(
    calendarEventAttendees: CalendarEventAttendee[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (calendarEventAttendees.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const valuesString = valuesStringForBatchRawQuery(
      calendarEventAttendees,
      5,
    );

    const values = calendarEventAttendees.flatMap((calendarEventAttendee) => [
      calendarEventAttendee.calendarEventId,
      calendarEventAttendee.handle,
      calendarEventAttendee.displayName,
      calendarEventAttendee.isOrganizer,
      calendarEventAttendee.responseStatus,
    ]);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventAttendee" AS "calendarEventAttendee"
      SET "calendarEventId" = "newValues"."calendarEventId",
      "displayName" = "newValues"."displayName",
      "isOrganizer" = "newValues"."isOrganizer",
      "responseStatus" = "newValues"."responseStatus"
      FROM (VALUES ${valuesString}) AS "newValues"("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus")
      WHERE "calendarEventAttendee"."handle" = "newValues"."handle"`,
      values,
      workspaceId,
      transactionManager,
    );
  }
}
