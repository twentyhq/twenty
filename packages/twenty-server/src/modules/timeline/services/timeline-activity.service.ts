import { Injectable } from '@nestjs/common';

import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { TimelineActivityObjectMetadata } from 'src/modules/timeline/standard-objects/timeline-activity.object-metadata';

type TransformedEvent = ObjectRecordBaseEvent & {
  objectName?: string;
  linkedRecordCachedName?: string;
  linkedRecordId?: string;
  linkedObjectMetadataId?: string;
};

@Injectable()
export class TimelineActivityService {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityObjectMetadata)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async upsertEvent(event: ObjectRecordBaseEvent) {
    const events = await this.transformEvent(event);

    if (!events || events.length === 0) return;

    for (const event of events) {
      return await this.timelineActivityRepository.upsertOne(
        event.name,
        event.properties,
        event.objectName ?? event.objectMetadata.nameSingular,
        event.recordId,
        event.workspaceId,
        event.workspaceMemberId,
        event.linkedRecordCachedName,
        event.linkedRecordId,
        event.linkedObjectMetadataId,
      );
    }
  }

  private async transformEvent(
    event: ObjectRecordBaseEvent,
  ): Promise<TransformedEvent[]> {
    if (
      ['activity', 'messageParticipant', 'activityTarget'].includes(
        event.objectMetadata.nameSingular,
      )
    ) {
      return await this.handleLinkedObjects(event);
    }

    return [event];
  }

  private async handleLinkedObjects(event: ObjectRecordBaseEvent) {
    const dataSourceSchema = this.workspaceDataSourceService.getSchemaName(
      event.workspaceId,
    );

    switch (event.objectMetadata.nameSingular) {
      case 'activityTarget':
        return this.processActivityTarget(event, dataSourceSchema);
      case 'activity':
        return this.processActivity(event, dataSourceSchema);
      default:
        return [];
    }
  }

  private async processActivity(
    event: ObjectRecordBaseEvent,
    dataSourceSchema: string,
  ) {
    const activityTargets =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."activityTarget"
          WHERE "activityId" = $1`,
        [event.recordId],
        event.workspaceId,
      );

    const activity = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."activity"
          WHERE "id" = $1`,
      [event.recordId],
      event.workspaceId,
    );

    if (activityTargets.length === 0) return;
    if (activity.length === 0) return;

    return activityTargets
      .map((activityTarget) => {
        const targetColumn: string[] = Object.entries(activityTarget)
          .map(([columnName, columnValue]: [string, string]) => {
            if (columnName === 'activityId' || !columnName.endsWith('Id'))
              return;
            if (columnValue === null) return;

            return columnName;
          })
          .filter((column): column is string => column !== undefined);

        if (targetColumn.length === 0) return;

        return {
          ...event,
          name: activity[0].type.toLowerCase() + '.' + event.name.split('.')[1],
          objectName: targetColumn[0].replace(/Id$/, ''),
          recordId: activityTarget[targetColumn[0]],
          linkedRecordCachedName: activity[0].title,
          linkedRecordId: activity[0].id,
          linkedObjectMetadataId: event.objectMetadata.id,
        } as TransformedEvent;
      })
      .filter((event): event is TransformedEvent => event !== undefined);
  }

  private async processActivityTarget(
    event: ObjectRecordBaseEvent,
    dataSourceSchema: string,
  ) {
    const activityTarget =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."activityTarget"
            WHERE "id" = $1`,
        [event.recordId],
        event.workspaceId,
      );

    if (activityTarget.length === 0) return;

    const activity = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."activity"
          WHERE "id" = $1`,
      [activityTarget[0].activityId],
      event.workspaceId,
    );

    if (activity.length === 0) return;

    const activityObjectMetadataId = event.objectMetadata.fields.find(
      (field) => field.name === 'activity',
    )?.toRelationMetadata?.fromObjectMetadataId;

    const targetColumn: string[] = Object.entries(activityTarget[0])
      .map(([columnName, columnValue]: [string, string]) => {
        if (columnName === 'activityId' || !columnName.endsWith('Id')) return;
        if (columnValue === null) return;

        return columnName;
      })
      .filter((column): column is string => column !== undefined);

    if (targetColumn.length === 0) return;

    return [
      {
        ...event,
        name: activity[0].type.toLowerCase() + '.' + event.name.split('.')[1],
        properties: {},
        objectName: targetColumn[0].replace(/Id$/, ''),
        recordId: activityTarget[0][targetColumn[0]],
        linkedRecordCachedName: activity[0].title,
        linkedRecordId: activity[0].id,
        linkedObjectMetadataId: activityObjectMetadataId,
      },
    ] as TransformedEvent[];
  }
}
