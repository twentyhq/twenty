import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

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

  public async countByEventExternalIdsAndCalendarChannelId(
    eventExternalIds: string[],
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT COUNT(*) FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "eventExternalId" = ANY($1) AND "calendarChannelId" = $2`,
      [eventExternalIds, calendarChannelId],
      workspaceId,
      transactionManager,
    );

    return result[0]?.count;
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

  public async getByEventIds(
    eventIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "eventId" = ANY($1)`,
      [eventIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByEventThreadId(
    eventThreadId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelEventAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannelEventAssociation"
    WHERE "eventThreadId" = $1`,
      [eventThreadId],
      workspaceId,
      transactionManager,
    );
  }
}
