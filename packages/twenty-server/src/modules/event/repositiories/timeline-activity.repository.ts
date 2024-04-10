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

    if (objectName === 'activity') {
      const activityTargets =
        await this.workspaceDataSourceService.executeRawQuery(
          `SELECT * FROM ${dataSourceSchema}."activityTarget"
        WHERE "activityId" = $1`,
          [objectId],
          workspaceId,
        );

      if (activityTargets.length === 0) return;

      Object.entries(activityTargets[0]).forEach(
        ([columnName, columnValue]: [string, string]) => {
          if (columnName === 'activityId' || !columnName.endsWith('Id')) return;
          if (columnValue === null) return;
          this.upsertOne(
            name,
            properties,
            workspaceMemberId,
            columnName.replace(/Id$/, ''),
            columnValue,
            workspaceId,
          );
        },
      );
    }
  }

  private async upsertOne(
    name: string,
    properties: string,
    workspaceMemberId: string | null,
    objectName: string,
    objectId: string,
    workspaceId: string,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const recentActivity =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."timelineActivity"
      WHERE "${objectName}Id" = $1 AND "createdAt" >= NOW() - interval '10 minutes'`,
        [objectId],
        workspaceId,
      );

    if (recentActivity.length !== 0) {
      await this.workspaceDataSourceService.executeRawQuery(
        `UPDATE ${dataSourceSchema}."timelineActivity" 
      SET "properties" = $2, "workspaceMemberId" = $3
      WHERE "id" = $1`,
        [recentActivity[0].id, properties, workspaceMemberId],
        workspaceId,
      );

      return;
    }

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."timelineActivity"
    ("name", "properties", "workspaceMemberId", "${objectName}Id")
    VALUES ($1, $2, $3, $4)`,
      [name, properties, workspaceMemberId, objectId],
      workspaceId,
    );
  }
}
