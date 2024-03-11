import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { CalendarEventObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event.object-metadata';
import { valuesStringForBatchRawQuery } from 'src/workspace/calendar-and-messaging/utils/valueStringForBatchRawQuery.util';
import { CalendarEvent } from 'src/workspace/calendar/types/calendar-event';

@Injectable()
export class CalendarEventService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByIds(
    calendarEventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarEventObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarEvent" WHERE "id" = ANY($1)`,
      [calendarEventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    calendarEventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarEvent" WHERE "id" = ANY($1)`,
      [calendarEventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async saveCalendarEvents(
    calendarEvents: CalendarEvent[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const valuesString = valuesStringForBatchRawQuery(calendarEvents, 13);

    const values = calendarEvents.flatMap((calendarEvent) => [
      calendarEvent.title,
      calendarEvent.isCanceled,
      calendarEvent.isFullDay,
      calendarEvent.startsAt,
      calendarEvent.endsAt,
      calendarEvent.externalCreatedAt,
      calendarEvent.externalUpdatedAt,
      calendarEvent.description,
      calendarEvent.location,
      calendarEvent.iCalUID,
      calendarEvent.conferenceSolution,
      calendarEvent.conferenceUri,
      calendarEvent.recurringEventExternalId,
    ]);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarEvent" ("title", "isCanceled", "isFullDay", "startsAt", "endsAt", "externalCreatedAt", "externalUpdatedAt", "description", "location", "iCalUID", "conferenceSolution", "conferenceUri", "recurringEventExternalId") VALUES ${valuesString}`,
      values,
      workspaceId,
      transactionManager,
    );
  }

  public async updateCalendarEvents(
    calendarEvents: CalendarEvent[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (calendarEvents.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const valuesString = valuesStringForBatchRawQuery(calendarEvents, 13);

    const values = calendarEvents.flatMap((calendarEvent) => [
      calendarEvent.title,
      calendarEvent.isCanceled,
      calendarEvent.isFullDay,
      calendarEvent.startsAt,
      calendarEvent.endsAt,
      calendarEvent.externalCreatedAt,
      calendarEvent.externalUpdatedAt,
      calendarEvent.description,
      calendarEvent.location,
      calendarEvent.iCalUID,
      calendarEvent.conferenceSolution,
      calendarEvent.conferenceUri,
      calendarEvent.recurringEventExternalId,
    ]);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarEvent" AS "calendarEvent"
      SET "title" = "newData"."title",
      "isCanceled" = "newData"."isCanceled",
      "isFullDay" = "newData"."isFullDay",
      "startsAt" = "newData"."startsAt",
      "endsAt" = "newData"."endsAt",
      "externalCreatedAt" = "newData"."externalCreatedAt",
      "externalUpdatedAt" = "newData"."externalUpdatedAt",
      "description" = "newData"."description",
      "location" = "newData"."location",
      "conferenceSolution" = "newData"."conferenceSolution",
      "conferenceUri" = "newData"."conferenceUri",
      "recurringEventExternalId" = "newData"."recurringEventExternalId"
      FROM (VALUES ${valuesString})
      AS "newData"("title", "isCanceled", "isFullDay", "startsAt", "endsAt", "externalCreatedAt", "externalUpdatedAt", "description", "location", "iCalUID", "conferenceSolution", "conferenceUri", "recurringEventExternalId")
      WHERE "calendarEvent"."iCalUID" = "newData"."iCalUID"`,
      values,
      workspaceId,
      transactionManager,
    );
  }
}
