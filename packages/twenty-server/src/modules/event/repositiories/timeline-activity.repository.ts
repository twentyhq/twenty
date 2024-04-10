import { Injectable } from '@nestjs/common';

import { objectRecordDiffMerge } from 'src/engine/integrations/event-emitter/utils/object-record-diff-merge';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async upsert(
    name: string,
    properties: Record<string, any>,
    workspaceMemberId: string | null,
    objectName: string,
    objectId: string,
    workspaceId: string,
  ): Promise<void> {
    if (['activity', 'messageParticipant'].includes(objectName)) {
      return await this.handleSecondOrderObjects(
        name,
        properties,
        workspaceMemberId,
        objectName,
        objectId,
        workspaceId,
      );
    }

    return await this.upsertOne(
      name,
      'object',
      properties,
      workspaceMemberId,
      objectName,
      objectId,
      workspaceId,
    );
  }

  private async handleSecondOrderObjects(
    name: string,
    properties: Record<string, any>,
    workspaceMemberId: string | null,
    objectName: string,
    objectId: string,
    workspaceId: string,
  ) {
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
            activityTargets[0].id,
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
    // Todo handle message participants
  }

  private async upsertOne(
    name: string,
    type: string,
    properties: Record<string, any>,
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
      WHERE "${objectName}Id" = $1
      AND ("name" = $2 OR "name" = $3)
      AND "workspaceMemberId" = $4
      AND "createdAt" >= NOW() - interval '10 minutes'`,
        [
          objectId,
          name,
          name.replace(/\.updated$/, '.created'),
          workspaceMemberId,
        ],
        workspaceId,
      );

    if (recentActivity.length !== 0) {
      // Now we need to merge the .diff

      const newProps = objectRecordDiffMerge(
        recentActivity[0].properties,
        properties,
      );

      await this.workspaceDataSourceService.executeRawQuery(
        `UPDATE ${dataSourceSchema}."timelineActivity" 
      SET "properties" = $2, "workspaceMemberId" = $3
      WHERE "id" = $1`,
        [recentActivity[0].id, newProps, workspaceMemberId],
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
