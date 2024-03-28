import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class EventRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async insert(
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
      `INSERT INTO ${dataSourceSchema}."event"
      ("name", "properties", "workspaceMemberId", "${objectName}Id")
      VALUES ($1, $2, $3, $4)`,
      [name, properties, workspaceMemberId, objectId],
      workspaceId,
    );
  }
}
