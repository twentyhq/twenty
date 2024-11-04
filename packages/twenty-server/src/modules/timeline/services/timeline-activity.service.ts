import { Injectable } from '@nestjs/common';

import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

type TransformedEvent = ObjectRecordBaseEvent & {
  objectName?: string;
  linkedRecordCachedName?: string;
  linkedRecordId?: string;
  linkedObjectMetadataId?: string;
};

@Injectable()
export class TimelineActivityService {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  private targetObjects: Record<string, string> = {
    note: 'noteTarget',
    task: 'taskTarget',
  };

  async upsertEvent({
    event,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    eventName: string;
    workspaceId: string;
  }) {
    const events = await this.transformEvent({ event, workspaceId, eventName });

    if (!events || events.length === 0) return;

    for (const event of events) {
      await this.timelineActivityRepository.upsertOne(
        eventName,
        event.properties,
        event.objectName ?? event.objectMetadata.nameSingular,
        event.recordId,
        workspaceId,
        event.workspaceMemberId,
        event.linkedRecordCachedName,
        event.linkedRecordId,
        event.linkedObjectMetadataId,
      );
    }
  }

  private async transformEvent({
    event,
    workspaceId,
    eventName,
  }: {
    event: ObjectRecordBaseEvent;
    workspaceId: string;
    eventName: string;
  }): Promise<TransformedEvent[]> {
    if (['note', 'task'].includes(event.objectMetadata.nameSingular)) {
      const linkedObjects = await this.handleLinkedObjects({
        event,
        workspaceId,
        eventName,
      });

      // 2 timelines, one for the linked object and one for the task/note
      if (linkedObjects?.length > 0) return [...linkedObjects, event];
    }

    if (
      ['noteTarget', 'taskTarget', 'messageParticipant'].includes(
        event.objectMetadata.nameSingular,
      )
    ) {
      return await this.handleLinkedObjects({ event, workspaceId, eventName });
    }

    return [event];
  }

  private async handleLinkedObjects({
    event,
    workspaceId,
    eventName,
  }: {
    event: ObjectRecordBaseEvent;
    workspaceId: string;
    eventName: string;
  }) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    switch (event.objectMetadata.nameSingular) {
      case 'noteTarget':
        return this.processActivityTarget({
          event,
          dataSourceSchema,
          activityType: 'note',
          eventName,
          workspaceId,
        });
      case 'taskTarget':
        return this.processActivityTarget({
          event,
          dataSourceSchema,
          activityType: 'task',
          eventName,
          workspaceId,
        });
      case 'note':
      case 'task':
        return this.processActivity({
          event,
          dataSourceSchema,
          activityType: event.objectMetadata.nameSingular,
          eventName,
          workspaceId,
        });
      default:
        return [];
    }
  }

  private async processActivity({
    event,
    dataSourceSchema,
    activityType,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    dataSourceSchema: string;
    activityType: string;
    eventName: string;
    workspaceId: string;
  }) {
    const activityTargets =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."${this.targetObjects[activityType]}"
          WHERE "${activityType}Id" = $1`,
        [event.recordId],
        workspaceId,
      );

    const activity = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."${activityType}"
          WHERE "id" = $1`,
      [event.recordId],
      workspaceId,
    );

    if (activityTargets.length === 0) return;
    if (activity.length === 0) return;

    return activityTargets
      .map((activityTarget) => {
        const targetColumn: string[] = Object.entries(activityTarget)
          .map(([columnName, columnValue]: [string, string]) => {
            if (
              columnName === activityType + 'Id' ||
              !columnName.endsWith('Id')
            )
              return;
            if (columnValue === null) return;

            return columnName;
          })
          .filter((column): column is string => column !== undefined);

        if (targetColumn.length === 0) return;

        return {
          ...event,
          name: 'linked-' + eventName,
          objectName: targetColumn[0].replace(/Id$/, ''),
          recordId: activityTarget[targetColumn[0]],
          linkedRecordCachedName: activity[0].title,
          linkedRecordId: activity[0].id,
          linkedObjectMetadataId: event.objectMetadata.id,
        } as TransformedEvent;
      })
      .filter((event): event is TransformedEvent => event !== undefined);
  }

  private async processActivityTarget({
    event,
    dataSourceSchema,
    activityType,
    eventName,
    workspaceId,
  }: {
    event: ObjectRecordBaseEvent;
    dataSourceSchema: string;
    activityType: string;
    eventName: string;
    workspaceId: string;
  }) {
    const activityTarget =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."${this.targetObjects[activityType]}"
            WHERE "id" = $1`,
        [event.recordId],
        workspaceId,
      );

    if (activityTarget.length === 0) return;

    const activity = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."${activityType}"
          WHERE "id" = $1`,
      [activityTarget[0].activityId],
      workspaceId,
    );

    if (activity.length === 0) return;

    const activityObjectMetadataId = event.objectMetadata.fields.find(
      (field) => field.name === activityType,
    )?.toRelationMetadata?.fromObjectMetadataId;

    const targetColumn: string[] = Object.entries(activityTarget[0])
      .map(([columnName, columnValue]: [string, string]) => {
        if (columnName === activityType + 'Id' || !columnName.endsWith('Id'))
          return;
        if (columnValue === null) return;

        return columnName;
      })
      .filter((column): column is string => column !== undefined);

    if (targetColumn.length === 0) return;

    return [
      {
        ...event,
        name: 'linked-' + eventName,
        properties: {},
        objectName: targetColumn[0].replace(/Id$/, ''),
        recordId: activityTarget[0][targetColumn[0]],
        linkedRecordCachedName: activity[0].title,
        linkedRecordId: activity[0].id,
        linkedObjectMetadataId: activityObjectMetadataId,
      } as TransformedEvent,
    ];
  }
}
