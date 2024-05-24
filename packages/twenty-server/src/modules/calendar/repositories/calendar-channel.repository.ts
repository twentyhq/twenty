import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class CalendarChannelRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getAll(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannel"`,
      [],
      workspaceId,
      transactionManager,
    );
  }

  public async create(
    calendarChannel: Pick<
      ObjectRecord<CalendarChannelWorkspaceEntity>,
      'id' | 'connectedAccountId' | 'handle' | 'visibility'
    >,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."calendarChannel" (id, "connectedAccountId", "handle", "visibility") VALUES ($1, $2, $3, $4)`,
      [
        calendarChannel.id,
        calendarChannel.connectedAccountId,
        calendarChannel.handle,
        calendarChannel.visibility,
      ],
      workspaceId,
      transactionManager,
    );
  }

  public async getByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelWorkspaceEntity>[]> {
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
  ): Promise<ObjectRecord<CalendarChannelWorkspaceEntity> | undefined> {
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
  ): Promise<ObjectRecord<CalendarChannelWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."calendarChannel" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }

  public async getIdsByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<CalendarChannelWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const calendarChannelIds =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "calendarChannel".id FROM ${dataSourceSchema}."calendarChannel" "calendarChannel"
        JOIN ${dataSourceSchema}."connectedAccount" ON "calendarChannel"."connectedAccountId" = ${dataSourceSchema}."connectedAccount"."id"
        WHERE ${dataSourceSchema}."connectedAccount"."accountOwnerId" = $1`,
        [workspaceMemberId],
        workspaceId,
        transactionManager,
      );

    return calendarChannelIds;
  }

  public async updateSyncCursor(
    syncCursor: string | null,
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
