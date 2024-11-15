import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async upsertOne(
    name: string,
    properties: Partial<ObjectRecord>,
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

    // If the diff is empty, we don't need to insert or update an activity
    // this should be handled differently, events should not be triggered when we will use proper DB events.
    const isDiffEmpty =
      properties.diff !== null &&
      properties.diff &&
      Object.keys(properties.diff).length === 0;

    if (isDiffEmpty) {
      return;
    }

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
      AND "name" = $2
      AND "workspaceMemberId" = $3
      AND ${
        linkedRecordId ? `"linkedRecordId" = $4` : `"linkedRecordId" IS NULL`
      }
      AND "createdAt" >= NOW() - interval '10 minutes'`,
      linkedRecordId
        ? [recordId, name, workspaceMemberId, linkedRecordId]
        : [recordId, name, workspaceMemberId],
      workspaceId,
    );
  }

  private async updateTimelineActivity(
    dataSourceSchema: string,
    id: string,
    properties: Partial<ObjectRecord>,
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
    properties: Partial<ObjectRecord>,
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

  public async insertTimelineActivitiesForObject(
    objectName: string,
    activities: {
      name: string;
      properties: Partial<ObjectRecord> | null;
      workspaceMemberId: string | undefined;
      recordId: string | null;
      linkedRecordCachedName: string;
      linkedRecordId: string | null | undefined;
      linkedObjectMetadataId: string | undefined;
    }[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (activities.length === 0) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."timelineActivity"
    ("name", "properties", "workspaceMemberId", "${objectName}Id", "linkedRecordCachedName", "linkedRecordId", "linkedObjectMetadataId")
    VALUES ${activities
      .map(
        (_, index) =>
          `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${
            index * 7 + 4
          }, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`,
      )
      .join(',')}`,
      activities
        .map((activity) => [
          activity.name,
          activity.properties,
          activity.workspaceMemberId,
          activity.recordId,
          activity.linkedRecordCachedName ?? '',
          activity.linkedRecordId,
          activity.linkedObjectMetadataId,
        ])
        .flat(),
      workspaceId,
      transactionManager,
    );
  }
}
