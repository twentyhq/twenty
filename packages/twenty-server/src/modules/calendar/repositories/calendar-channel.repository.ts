import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { CalendarChannelObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class CalendarChannelRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannel" WHERE "connectedAccountId" = $1 LIMIT 1`,
      [connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async getFirstByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<CalendarChannelObjectMetadata> | undefined> {
    const calendarChannels = await this.getByConnectedAccountId(
      connectedAccountId,
      workspaceId,
    );

    return calendarChannels[0];
  }

  public async getByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannel" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }

  public async updateSyncCursor(
    syncCursor: string,
    calendarChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."calendarChannel" SET "syncCursor" = $1 WHERE "id" = $2`,
      [syncCursor, calendarChannelId],
      workspaceId,
      transactionManager,
    );
  }
}
