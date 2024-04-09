import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async upsert(
    name: string,
    properties: string,
    workspaceMemberId: string | null,
    objectName: string,
    objectId: string,
    workspaceId: string,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."timelineActivity"
      ("name", "properties", "workspaceMemberId", "${objectName}id")
      VALUES ($1, $2, $3, $4)`,
      [name, properties, workspaceMemberId, objectId],
      workspaceId,
    );
  }
}
