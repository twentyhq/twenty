import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import differenceWith from 'lodash.differencewith';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CalendarEventAttendeeObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-attendee.object-metadata';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/getFlattenedValuesAndValuesStringForBatchRawQuery.util';
import {
  CalendarEventAttendee,
  CalendarEventAttendeeWithId,
} from 'src/modules/calendar/types/calendar-event';

@Injectable()
export class CalendarEventAttendeeRepository {
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
      `SELECT * FROM ${dataSourceSchema}."calendarEventAttendee" WHERE "id" = ANY($1)`,
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
      `SELECT * FROM ${dataSourceSchema}."calendarEventAttendee" WHERE "calendarEventId" = ANY($1)`,
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
      `DELETE FROM ${dataSourceSchema}."calendarEventAttendee" WHERE "id" = ANY($1)`,
      [calendarEventAttendeeIds],
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

    const calendarEventIds = Array.from(iCalUIDCalendarEventIdMap.values());

    const existingCalendarEventAttendees = await this.getByCalendarEventIds(
      calendarEventIds,
      workspaceId,
      transactionManager,
    );

    const calendarEventAttendeesToDelete = differenceWith(
      existingCalendarEventAttendees,
      calendarEventAttendees,
      (existingCalendarEventAttendee, calendarEventAttendee) =>
        existingCalendarEventAttendee.handle === calendarEventAttendee.handle,
    );

    await this.deleteByIds(
      calendarEventAttendeesToDelete.map(
        (calendarEventAttendee) => calendarEventAttendee.id,
      ),
      workspaceId,
      transactionManager,
    );

    const values = calendarEventAttendees.map((calendarEventAttendee) => ({
      ...calendarEventAttendee,
      calendarEventId: iCalUIDCalendarEventIdMap.get(
        calendarEventAttendee.iCalUID,
      ),
    }));

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(values, {
        calendarEventId: 'uuid',
        handle: 'text',
        displayName: 'text',
        isOrganizer: 'boolean',
        responseStatus: `${dataSourceSchema}."calendarEventAttendee_responsestatus_enum"`,
      });

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEventAttendee" AS "calendarEventAttendee"
      SET "displayName" = "newValues"."displayName",
      "isOrganizer" = "newValues"."isOrganizer",
      "responseStatus" = "newValues"."responseStatus"
      FROM (VALUES ${valuesString}) AS "newValues"("calendarEventId", "handle", "displayName", "isOrganizer", "responseStatus")
      WHERE "calendarEventAttendee"."handle" = "newValues"."handle"
      AND "calendarEventAttendee"."calendarEventId" = "newValues"."calendarEventId"`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }

  public async getWithoutPersonIdAndWorkspaceMemberId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<CalendarEventAttendeeWithId[]> {
    if (!workspaceId) {
      throw new Error('WorkspaceId is required');
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarEventAttendees: CalendarEventAttendeeWithId[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "calendarEventAttendee".*
        FROM ${dataSourceSchema}."calendarEventAttendee" AS "calendarEventAttendee"
        WHERE "calendarEventAttendee"."personId" IS NULL
        AND "calendarEventAttendee"."workspaceMemberId" IS NULL`,
        [],
        workspaceId,
        transactionManager,
      );

    return calendarEventAttendees;
  }
}
