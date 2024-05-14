import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';

@Injectable()
export class BlocklistRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getById(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<BlocklistObjectMetadata> | null> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const blocklistItems =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."blocklist" WHERE "id" = $1`,
        [id],
        workspaceId,
        transactionManager,
      );

    if (!blocklistItems || blocklistItems.length === 0) {
      return null;
    }

    return blocklistItems[0];
  }

  public async getByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<BlocklistObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."blocklist" WHERE "workspaceMemberId" = $1`,
      [workspaceMemberId],
      workspaceId,
      transactionManager,
    );
  }

  public async getByWorkspaceMemberIdAndHandle(
    workspaceMemberId: string,
    handle: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<BlocklistObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."blocklist" WHERE "workspaceMemberId" = $1 AND "handle" = $2`,
      [workspaceMemberId, handle],
      workspaceId,
      transactionManager,
    );
  }
}
