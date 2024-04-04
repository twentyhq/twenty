import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  MessageChannelObjectMetadata,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageChannelRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getAll(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannel"`,
      [],
      workspaceId,
      transactionManager,
    );
  }

  public async getByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannel" WHERE "connectedAccountId" = $1 AND "type" = 'email' LIMIT 1`,
      [connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async getFirstByConnectedAccountIdOrFail(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>> {
    const messageChannel = await this.getFirstByConnectedAccountId(
      connectedAccountId,
      workspaceId,
    );

    if (!messageChannel) {
      throw new Error(
        `Message channel for connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    return messageChannel;
  }

  public async getFirstByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata> | undefined> {
    const messageChannels = await this.getByConnectedAccountId(
      connectedAccountId,
      workspaceId,
      transactionManager,
    );

    return messageChannels[0];
  }

  public async getByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannel" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }

  public async updateSyncStatus(
    id: string,
    syncStatus: MessageChannelSyncStatus,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const needsToUpdateSyncedAt =
      syncStatus === MessageChannelSyncStatus.SUCCEEDED;

    const needsToUpdateOngoingSyncStartedAt =
      syncStatus === MessageChannelSyncStatus.ONGOING;

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageChannel" SET "syncStatus" = $1 ${
        needsToUpdateSyncedAt ? `, "syncedAt" = NOW()` : ''
      } ${
        needsToUpdateOngoingSyncStartedAt
          ? `, "ongoingSyncStartedAt" = NOW()`
          : `, "ongoingSyncStartedAt" = NULL`
      } WHERE "id" = $2`,
      [syncStatus, id],
      workspaceId,
      transactionManager,
    );
  }

  public async updateLastSyncCursorIfHigher(
    id: string,
    syncCursor: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageChannel" SET "syncCursor" = $1
      WHERE "id" = $2
      AND ("syncCursor" < $1 OR "syncCursor" = '')`,
      [syncCursor, id],
      workspaceId,
      transactionManager,
    );
  }

  public async resetSyncCursor(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageChannel" SET "syncCursor" = ''
      WHERE "id" = $1`,
      [id],
      workspaceId,
      transactionManager,
    );
  }
}
