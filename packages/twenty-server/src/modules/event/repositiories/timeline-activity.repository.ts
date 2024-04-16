import { Injectable } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

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
    objectMetadata: ObjectMetadataInterface,
    objectId: string,
    workspaceId: string,
  ): Promise<void> {
    if (
      ['activity', 'messageParticipant', 'activityTarget'].includes(
        objectMetadata.nameSingular,
      )
    ) {
      return await this.handleSecondOrderObjects(
        name,
        properties,
        workspaceMemberId,
        objectMetadata,
        objectId,
        workspaceId,
      );
    }

    return await this.upsertOne(
      name,
      properties,
      workspaceMemberId,
      objectMetadata.nameSingular,
      objectId,
      workspaceId,
    );
  }

  private async handleSecondOrderObjects(
    name: string,
    properties: Record<string, any>,
    workspaceMemberId: string | null,
    objectMetadata: ObjectMetadataInterface,
    objectId: string,
    workspaceId: string,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    if (objectMetadata.nameSingular === 'activityTarget') {
      const activityTarget =
        await this.workspaceDataSourceService.executeRawQuery(
          `SELECT * FROM ${dataSourceSchema}."activityTarget"
            WHERE "id" = $1`,
          [objectId],
          workspaceId,
        );

      if (activityTarget.length === 0) return;

      const activity = await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."activity"
          WHERE "id" = $1`,
        [activityTarget[0].activityId],
        workspaceId,
      );

      if (activity.length === 0) return;

      Object.entries(activityTarget[0]).forEach(
        ([columnName, columnValue]: [string, string]) => {
          if (columnName === 'activityId' || !columnName.endsWith('Id')) return;
          if (columnValue === null) return;
          this.upsertOne(
            activity[0].type + '.' + name.split('.')[1],
            {},
            workspaceMemberId,
            columnName.replace(/Id$/, ''),
            columnValue,
            workspaceId,
            activity[0].title,
            activityTarget[0].id,
            objectMetadata.id,
          );
        },
      );
    }

    if (objectMetadata.nameSingular === 'activity') {
      const activityTargets =
        await this.workspaceDataSourceService.executeRawQuery(
          `SELECT * FROM ${dataSourceSchema}."activityTarget"
          WHERE "activityId" = $1`,
          [objectId],
          workspaceId,
        );

      const activity = await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."activity"
          WHERE "id" = $1`,
        [objectId],
        workspaceId,
      );

      if (activityTargets.length === 0) return;
      if (activity.length === 0) return;

      activityTargets.forEach((activityTarget) => {
        Object.entries(activityTarget).forEach(
          ([columnName, columnValue]: [string, string]) => {
            if (columnName === 'activityId' || !columnName.endsWith('Id'))
              return;
            if (columnValue === null) return;
            this.upsertOne(
              activity[0].type + '.' + name.split('.')[1],
              properties,
              workspaceMemberId,
              columnName.replace(/Id$/, ''),
              columnValue,
              workspaceId,
              activity[0].name,
              activity[0].id,
              objectMetadata.id,
            );
          },
        );
      });
    }
  }

  private async upsertOne(
    name: string,
    properties: Record<string, any>,
    workspaceMemberId: string | null,
    objectName: string,
    objectId: string,
    workspaceId: string,
    linkedRecordCachedName?: string,
    linkedRecordId?: string,
    linkedObjectMetadataId?: string,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const recentTimelineActivity =
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

    if (recentTimelineActivity.length !== 0) {
      const newProps = objectRecordDiffMerge(
        recentTimelineActivity[0].properties,
        properties,
      );

      await this.workspaceDataSourceService.executeRawQuery(
        `UPDATE ${dataSourceSchema}."timelineActivity" 
      SET "properties" = $2, "workspaceMemberId" = $3
      WHERE "id" = $1`,
        [recentTimelineActivity[0].id, newProps, workspaceMemberId],
        workspaceId,
      );

      return;
    }

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."timelineActivity"
    ("name", "properties", "workspaceMemberId", "${objectName}Id", "linkedRecordCachedName", "linkedRecordId", "linkedObjectMetadataId")
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        name,
        properties,
        workspaceMemberId,
        objectId,
        linkedRecordCachedName ?? '',
        linkedRecordId,
        linkedObjectMetadataId,
      ],
      workspaceId,
    );
  }
}
