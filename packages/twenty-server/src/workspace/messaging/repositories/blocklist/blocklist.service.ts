import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { BlocklistObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/blocklist.object-metadata';

@Injectable()
export class BlocklistService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

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
}
