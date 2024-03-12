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
    if (calendarEventAttendeeIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEventAttendees" WHERE "id" = ANY($1)`,
      [calendarEventAttendeeIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByCalendarEventIds(
    calendarEventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarEventAttendeeObjectMetadata>[]> {
    if (calendarEventIds.length === 0) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEventAttendees" WHERE "calendarEventId" = ANY($1)`,
      [calendarEventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    calendarEventAttendeeIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (calendarEventAttendeeIds.length === 0) {
      return;
    }

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
    iCalUIDCalendarEventIdMap: Map<string, string>,
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
      [
        'text',
        'text',
        'text',
        'boolean',
        `${dataSourceSchema}."calendarEventAttendee_responsestatus_enum"`,
      ],
    );

    const values = calendarEventAttendees.flatMap((calendarEventAttendee) => [
      iCalUIDCalendarEventIdMap[calendarEventAttendee.iCalUID],
      calendarEventAttendee.handle,
      calendarEventAttendee.displayName,
      calendarEventAttendee.isOrganizer,
      calendarEventAttendee.responseStatus,
    ]);

    // const existingCalendarEventAttendeeIds = await this.getByCalendarEventIds(
    //   calendarEventAttendees.map(
    //     (calendarEventAttendee) => calendarEventAttendee.calendarEventId,
    //   ),
    //   workspaceId,
    //   transactionManager,
    // );

    // const calendarEventAttendeesToDelete =
    //   existingCalendarEventAttendeeIds.filter(
    //     (existingCalendarEventAttendee) =>
    //       !calendarEventAttendees.find(
    //         (calendarEventAttendee) =>
    //           calendarEventAttendee.calendarEventId ===
    //             existingCalendarEventAttendee.calendarEventId &&
    //           calendarEventAttendee.handle ===
    //             existingCalendarEventAttendee.handle,
    //       ),
    //   );

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventAttendee" AS "calendarEventAttendee"
      SET "displayName" = "newValues"."displayName",
      "isOrganizer" = "newValues"."isOrganizer",
      "responseStatus" = "newValues"."responseStatus"
      FROM (VALUES ${valuesString}) AS "newValues"("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus")
      WHERE "calendarEventAttendee"."handle" = "newValues"."handle"
      AND "calendarEventAttendee"."calendarEventId" = "newValues"."calendarEventId"`,
      values,
      workspaceId,
      transactionManager,
    );
  }
}
