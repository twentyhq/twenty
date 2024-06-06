import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { objectRecordDiffMerge } from 'src/engine/integrations/event-emitter/utils/object-record-diff-merge';

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async upsertOne(
    name: string,
    properties: Record<string, any>,
    objectName: string,
    recordId: string,
    workspaceId: string,
    workspaceMemberId?: string,
    linkedRecordCachedName?: string,
    linkedRecordId?: string,
    linkedObjectMetadataId?: string,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const recentTimelineActivity = await this.findRecentTimelineActivity(
      dataSourceSchema,
      name,
      objectName,
      recordId,
      workspaceMemberId,
      linkedRecordId,
      workspaceId,
    );

    if (recentTimelineActivity.length !== 0) {
      const newProps = objectRecordDiffMerge(
        recentTimelineActivity[0].properties,
        properties,
      );

      return this.updateTimelineActivity(
        dataSourceSchema,
        recentTimelineActivity[0].id,
        newProps,
        workspaceMemberId,
        workspaceId,
      );
    }

    return this.insertTimelineActivity(
      dataSourceSchema,
      name,
      properties,
      objectName,
      recordId,
      workspaceMemberId,
      linkedRecordCachedName ?? '',
      linkedRecordId,
      linkedObjectMetadataId,
      workspaceId,
    );
  }

  private async findRecentTimelineActivity(
    dataSourceSchema: string,
    name: string,
    objectName: string,
    recordId: string,
    workspaceMemberId: string | undefined,
    linkedRecordId: string | undefined,
    workspaceId: string,
  ) {
    return this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."timelineActivity"
      WHERE "${objectName}Id" = $1
      AND ("name" = $2 OR "name" = $3)
      AND "workspaceMemberId" = $4
      AND "linkedRecordId" = $5
      AND "createdAt" >= NOW() - interval '10 minutes'`,
      [
        recordId,
        name,
        name.replace(/\.updated$/, '.created'),
        workspaceMemberId,
        linkedRecordId,
      ],
      workspaceId,
    );
  }

  private async updateTimelineActivity(
    dataSourceSchema: string,
    id: string,
    properties: Record<string, any>,
    workspaceMemberId: string | undefined,
    workspaceId: string,
  ) {
    return this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."timelineActivity"
      SET "properties" = $2, "workspaceMemberId" = $3
      WHERE "id" = $1`,
      [id, properties, workspaceMemberId],
      workspaceId,
    );
  }

  private async insertTimelineActivity(
    dataSourceSchema: string,
    name: string,
    properties: Record<string, any>,
    objectName: string,
    recordId: string,
    workspaceMemberId: string | undefined,
    linkedRecordCachedName: string,
    linkedRecordId: string | undefined,
    linkedObjectMetadataId: string | undefined,
    workspaceId: string,
  ) {
    return this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."timelineActivity"
    ("name", "properties", "workspaceMemberId", "${objectName}Id", "linkedRecordCachedName", "linkedRecordId", "linkedObjectMetadataId")
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        name,
        properties,
        workspaceMemberId,
        recordId,
        linkedRecordCachedName ?? '',
        linkedRecordId,
        linkedObjectMetadataId,
      ],
      workspaceId,
    );
  }
}
