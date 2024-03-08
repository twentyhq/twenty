import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { CalendarChannelEventAssociationObjectMetadata } from 'packages/twenty-server/dist/src/workspace/workspace-sync-metadata/standard-objects/calendar-channel-event-association.object-metadata';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { valuesStringForBatchRawQuery } from 'src/workspace/calendar-and-messaging/utils/valueStringForBatchRawQuery.util';

@Injectable()
export class CalendarChannelEventAssociationService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByEventExternalIdsAndCalendarChannelId(
    eventExternalIds: string[],
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "eventExternalId" = ANY($1) AND "calendarChannelId" = $2`,
      [eventExternalIds, calendarChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByEventExternalIdsAndCalendarChannelId(
    eventExternalIds: string[],
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation" WHERE "eventExternalId" = ANY($1) AND "calendarChannelId" = $2`,
      [eventExternalIds, calendarChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async getByCalendarChannelIds(
    calendarChannelIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "calendarChannelId" = ANY($1)`,
      [calendarChannelIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByCalendarChannelId(
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    this.deleteByCalendarChannelIds(
      [calendarChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByCalendarChannelIds(
    calendarChannelIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (calendarChannelIds.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation" WHERE "calendarChannelId" = ANY($1)`,
      [calendarChannelIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."calendarChannelEventAssociation" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }

  public async getByCalendarEventIds(
    calendarEventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "calendarEventId" = ANY($1)`,
      [calendarEventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async saveCalendarChannelEventAssociations(
    calendarChannelEventAssociations: ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const valuesString = valuesStringForBatchRawQuery(
      calendarChannelEventAssociations,
    );

    const calendarChannelEventAssociationValues =
      calendarChannelEventAssociations.flatMap((association) => [
        association.id,
        association.calendarChannelId,
        association.calendarEventId,
        association.eventExternalId,
      ]);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarChannelEventAssociation" ("id", "calendarChannelId", "calendarEventId", "eventExternalId")
      VALUES ${valuesString}`,
      [calendarChannelEventAssociationValues],
      workspaceId,
      transactionManager,
    );
  }
}
