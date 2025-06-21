import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { CALENDAR_EVENT_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';
import { CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-participant-data-seeds.constant';
import { COMPANY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { MESSAGE_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-data-seeds.constant';
import { MESSAGE_PARTICIPANT_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-participant-data-seeds.constant';
import { NOTE_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import { NOTE_TARGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-target-data-seeds.constant';
import { OPPORTUNITY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { TASK_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';
import { TASK_TARGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-target-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

type TimelineActivitySeedData = Pick<
  TimelineActivityWorkspaceEntity,
  | 'id'
  | 'name'
  | 'linkedRecordCachedName'
  | 'linkedRecordId'
  | 'linkedObjectMetadataId'
  | 'workspaceMemberId'
  | 'companyId'
  | 'personId'
  | 'noteId'
  | 'taskId'
  | 'opportunityId'
> & {
  properties: string; // JSON stringified for raw insertion
  createdAt: string; // ISO string for raw insertion
  updatedAt: string; // ISO string for raw insertion
  happensAt: string; // ISO string for raw insertion
};

type ActivityTargetInfo = {
  targetType: string;
  targetId: string;
};

type CreateTimelineActivityParams = {
  entityType: string;
  recordSeed: Record<string, unknown>;
  index: number;
};

type CreateLinkedActivityParams = {
  activityType: 'note' | 'task' | 'calendarEvent' | 'message';
  recordSeed: Record<string, unknown>;
  index: number;
  activityIndex: number;
  linkedObjectMetadataId: string;
  targetInfo: ActivityTargetInfo;
};

type EntityConfig = {
  type: string;
  seeds: Array<Record<string, unknown>>;
};

type ObjectMetadataIds = {
  noteMetadataId: string;
  taskMetadataId: string;
  calendarEventMetadataId: string;
  messageMetadataId: string;
};

@Injectable()
export class TimelineActivitySeederService {
  private readonly ENTITY_CODES = {
    company: '0001',
    person: '0201',
    note: '0601',
    task: '0651',
    opportunity: '0851',
    calendarEvent: '0701',
    message: '0751',
  } as const;

  private readonly TARGET_CODES = {
    person: '1001',
    company: '2001',
    opportunity: '3001',
  } as const;

  private readonly LINKABLE_TYPES = new Set([
    'note',
    'task',
    'calendarEvent',
    'message',
  ]);

  constructor(private readonly objectMetadataService: ObjectMetadataService) {}

  private getLinkedActivityName(activityType: string): string {
    // Notes and tasks use the legacy format: linked-{type}.created
    if (activityType === 'note' || activityType === 'task') {
      return `linked-${activityType}.created`;
    }

    // Calendar events and messages use the new format: {type}.linked
    return `${activityType}.linked`;
  }

  async seedTimelineActivities({
    entityManager,
    schemaName,
    workspaceId,
  }: {
    entityManager: WorkspaceEntityManager;
    schemaName: string;
    workspaceId: string;
  }) {
    const timelineActivities: TimelineActivitySeedData[] = [];
    const metadataIds = await this.getObjectMetadataIds(workspaceId);
    let activityIndex = 0;

    const entityConfigs: EntityConfig[] = [
      { type: 'company', seeds: COMPANY_DATA_SEEDS },
      { type: 'person', seeds: PERSON_DATA_SEEDS },
      { type: 'note', seeds: NOTE_DATA_SEEDS },
      { type: 'task', seeds: TASK_DATA_SEEDS },
      { type: 'opportunity', seeds: OPPORTUNITY_DATA_SEEDS },
    ];

    // Calendar events and messages only appear as linked activities
    const linkableConfigs: EntityConfig[] = [
      { type: 'calendarEvent', seeds: CALENDAR_EVENT_DATA_SEEDS },
      { type: 'message', seeds: MESSAGE_DATA_SEEDS },
    ];

    entityConfigs.forEach(({ type, seeds }) => {
      seeds.forEach((seed, index) => {
        const activity = this.createTimelineActivity({
          entityType: type,
          recordSeed: seed,
          index,
        });

        timelineActivities.push(activity);
        activityIndex++;

        if (!this.LINKABLE_TYPES.has(type)) {
          return;
        }

        const linkedObjectMetadataId = this.getLinkedObjectMetadataId(
          type,
          metadataIds,
        );
        const linkedActivities = this.computeLinkedTimelineActivityRecords({
          activityType: type as 'note' | 'task' | 'calendarEvent' | 'message',
          recordSeed: seed,
          index,
          activityIndex,
          linkedObjectMetadataId,
        });

        timelineActivities.push(...linkedActivities);
        activityIndex += linkedActivities.length;
      });
    });

    // Create only linked activities for calendar events and messages
    linkableConfigs.forEach(({ type, seeds }) => {
      seeds.forEach((seed, index) => {
        const linkedObjectMetadataId = this.getLinkedObjectMetadataId(
          type,
          metadataIds,
        );
        const linkedActivities = this.computeLinkedTimelineActivityRecords({
          activityType: type as 'calendarEvent' | 'message',
          recordSeed: seed,
          index,
          activityIndex,
          linkedObjectMetadataId,
        });

        timelineActivities.push(...linkedActivities);
        activityIndex += linkedActivities.length;
      });
    });

    await this.insertTimelineActivities(
      entityManager,
      schemaName,
      timelineActivities,
    );
  }

  private getLinkedObjectMetadataId(
    type: string,
    metadataIds: ObjectMetadataIds,
  ): string {
    const metadataMap = {
      note: metadataIds.noteMetadataId,
      task: metadataIds.taskMetadataId,
      calendarEvent: metadataIds.calendarEventMetadataId,
      message: metadataIds.messageMetadataId,
    };

    return metadataMap[type as keyof typeof metadataMap] || '';
  }

  private async insertTimelineActivities(
    entityManager: WorkspaceEntityManager,
    schemaName: string,
    timelineActivities: TimelineActivitySeedData[],
  ) {
    if (timelineActivities.length === 0) {
      return;
    }

    const batchSize = 100;
    const timelineActivityBatches = chunk(timelineActivities, batchSize);

    for (const batch of timelineActivityBatches) {
      await entityManager
        .createQueryBuilder(undefined, undefined, undefined, {
          shouldBypassPermissionChecks: true,
        })
        .insert()
        .into(`${schemaName}.timelineActivity`, [
          'id',
          'name',
          'properties',
          'linkedRecordCachedName',
          'linkedRecordId',
          'linkedObjectMetadataId',
          'workspaceMemberId',
          'companyId',
          'personId',
          'noteId',
          'taskId',
          'opportunityId',
          'createdAt',
          'updatedAt',
          'happensAt',
        ])
        .orIgnore()
        .values(batch)
        .execute();
    }
  }

  private createTimelineActivity({
    entityType,
    recordSeed,
    index,
  }: CreateTimelineActivityParams): TimelineActivitySeedData {
    const timelineActivityId = this.generateTimelineActivityId(
      entityType,
      index + 1,
    );
    const creationDate = new Date().toISOString();
    const recordId = String(recordSeed.id || '');

    const timelineActivity: TimelineActivitySeedData = {
      id: timelineActivityId,
      name: `${entityType}.created`,
      properties: JSON.stringify({
        after: this.getEventAfterRecordProperties(entityType, recordSeed),
      }),
      linkedRecordCachedName: '',
      linkedRecordId: recordId,
      linkedObjectMetadataId: null,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      companyId: null,
      personId: null,
      noteId: null,
      taskId: null,
      opportunityId: null,
      createdAt: creationDate,
      updatedAt: creationDate,
      happensAt: creationDate,
    };

    // Set the appropriate entity ID
    const entityIdKey = `${entityType}Id`;

    // @ts-expect-error - This is okay for morph
    timelineActivity[entityIdKey] = recordId;

    return timelineActivity;
  }

  private generateTimelineActivityId(type: string, index: number): string {
    const prefix = '20202020';
    const code =
      this.ENTITY_CODES[type as keyof typeof this.ENTITY_CODES] || '0000';
    const paddedIndex = String(index).padStart(4, '0');

    return `${prefix}-${code}-4000-8001-${paddedIndex}00000001`;
  }

  private getEventAfterRecordProperties(
    type: string,
    recordSeed: Record<string, unknown>,
  ): Record<string, unknown> {
    const commonProperties = { id: recordSeed.id };

    const propertyGetters = {
      company: () => ({
        ...commonProperties,
        name: recordSeed.name,
        domainName: recordSeed.domainNamePrimaryLinkUrl,
        employees: recordSeed.employees,
        city: recordSeed.addressAddressCity,
      }),
      person: () => ({
        ...commonProperties,
        name: {
          firstName: recordSeed.nameFirstName,
          lastName: recordSeed.nameLastName,
        },
        email: recordSeed.emailsPrimaryEmail,
        jobTitle: recordSeed.jobTitle,
      }),
      note: () => ({
        ...commonProperties,
        title: recordSeed.title,
        body: recordSeed.body,
      }),
      task: () => ({
        ...commonProperties,
        title: recordSeed.title,
        body: recordSeed.body,
        status: recordSeed.status,
        dueAt: recordSeed.dueAt,
      }),
      opportunity: () => ({
        ...commonProperties,
        name: recordSeed.name,
        amount: recordSeed.amountAmountMicros,
        stage: recordSeed.stage,
        closeDate: recordSeed.closeDate,
      }),
      calendarEvent: () => ({
        ...commonProperties,
        title: recordSeed.title,
        description: recordSeed.description,
        startsAt: recordSeed.startsAt,
        endsAt: recordSeed.endsAt,
        location: recordSeed.location,
      }),
      message: () => ({
        ...commonProperties,
        subject: recordSeed.subject,
        text: recordSeed.text,
        receivedAt: recordSeed.receivedAt,
      }),
    };

    const getter = propertyGetters[type as keyof typeof propertyGetters];

    return getter ? getter() : commonProperties;
  }

  private computeLinkedTimelineActivityRecords({
    activityType,
    recordSeed,
    index,
    activityIndex,
    linkedObjectMetadataId,
  }: {
    activityType: 'note' | 'task' | 'calendarEvent' | 'message';
    recordSeed: Record<string, unknown>;
    index: number;
    activityIndex: number;
    linkedObjectMetadataId: string;
  }): TimelineActivitySeedData[] {
    const targetInfos = this.getActivityTargetInfos(activityType, recordSeed);

    if (targetInfos.length === 0) {
      return [];
    }

    return targetInfos.map((targetInfo, targetIndex) =>
      this.computeLinkedActivityRecord({
        activityType,
        recordSeed,
        index,
        activityIndex: activityIndex + targetIndex,
        linkedObjectMetadataId,
        targetInfo,
      }),
    );
  }

  private getActivityTargetInfos(
    activityType: 'note' | 'task' | 'calendarEvent' | 'message',
    recordSeed: Record<string, unknown>,
  ): ActivityTargetInfo[] {
    const targetGetters = {
      note: () => this.getNoteTargetInfos(recordSeed),
      task: () => this.getTaskTargetInfos(recordSeed),
      calendarEvent: () => this.getCalendarEventTargetInfos(recordSeed),
      message: () => this.getMessageTargetInfos(recordSeed),
    };

    const getter = targetGetters[activityType];

    return getter ? getter() : [];
  }

  private getNoteTargetInfos(
    recordSeed: Record<string, unknown>,
  ): ActivityTargetInfo[] {
    const noteTargetSeed = NOTE_TARGET_DATA_SEEDS.find(
      (target) => target.noteId === recordSeed.id,
    );

    if (!noteTargetSeed) {
      return [];
    }

    const targetChecks = [
      { id: noteTargetSeed.personId, type: 'person' },
      { id: noteTargetSeed.companyId, type: 'company' },
      { id: noteTargetSeed.opportunityId, type: 'opportunity' },
    ];

    for (const { id, type } of targetChecks) {
      if (id) {
        return [{ targetType: type, targetId: id }];
      }
    }

    return [];
  }

  private getTaskTargetInfos(
    recordSeed: Record<string, unknown>,
  ): ActivityTargetInfo[] {
    const taskTargetSeed = TASK_TARGET_DATA_SEEDS.find(
      (target) => target.taskId === recordSeed.id,
    );

    if (!taskTargetSeed) {
      return [];
    }

    const targetChecks = [
      { id: taskTargetSeed.personId, type: 'person' },
      { id: taskTargetSeed.companyId, type: 'company' },
      { id: taskTargetSeed.opportunityId, type: 'opportunity' },
    ];

    for (const { id, type } of targetChecks) {
      if (id) {
        return [{ targetType: type, targetId: id }];
      }
    }

    return [];
  }

  private getCalendarEventTargetInfos(
    recordSeed: Record<string, unknown>,
  ): ActivityTargetInfo[] {
    const eventParticipants = CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS.filter(
      (participant) => participant.calendarEventId === recordSeed.id,
    );

    const targetInfos: ActivityTargetInfo[] = [];

    eventParticipants.forEach((participant) => {
      if (participant.personId) {
        targetInfos.push({
          targetType: 'person',
          targetId: participant.personId as string,
        });

        const person = PERSON_DATA_SEEDS.find(
          (p) => p.id === participant.personId,
        );

        if (person?.companyId) {
          targetInfos.push({
            targetType: 'company',
            targetId: person.companyId as string,
          });
        }
      }
    });

    return targetInfos;
  }

  private getMessageTargetInfos(
    recordSeed: Record<string, unknown>,
  ): ActivityTargetInfo[] {
    const messageParticipants = MESSAGE_PARTICIPANT_DATA_SEEDS.filter(
      (participant) => participant.messageId === recordSeed.id,
    );

    const targetInfos: ActivityTargetInfo[] = [];

    messageParticipants.forEach((participant) => {
      if (participant.personId) {
        targetInfos.push({
          targetType: 'person',
          targetId: participant.personId,
        });

        const person = PERSON_DATA_SEEDS.find(
          (p) => p.id === participant.personId,
        );

        if (person?.companyId) {
          targetInfos.push({
            targetType: 'company',
            targetId: person.companyId as string,
          });
        }
      }
    });

    return targetInfos;
  }

  private computeLinkedActivityRecord({
    activityType,
    recordSeed,
    index,
    activityIndex,
    linkedObjectMetadataId,
    targetInfo,
  }: CreateLinkedActivityParams): TimelineActivitySeedData {
    const linkedActivityId = this.generateLinkedTimelineActivityId(
      activityType,
      targetInfo.targetType,
      activityIndex,
    );
    const creationDate = new Date().toISOString();
    const { linkedRecordCachedName, linkedProperties } =
      this.getLinkedRecordData(activityType, recordSeed, index);

    const linkedActivity: TimelineActivitySeedData = {
      id: linkedActivityId,
      name: this.getLinkedActivityName(activityType),
      properties: JSON.stringify({ after: linkedProperties }),
      linkedRecordCachedName,
      linkedRecordId: String(recordSeed.id || ''),
      linkedObjectMetadataId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      companyId: null,
      personId: null,
      noteId: null,
      taskId: null,
      opportunityId: null,
      createdAt: creationDate,
      updatedAt: creationDate,
      happensAt: creationDate,
    };

    // Set target ID (person, company, or opportunity)
    const targetIdKey = `${targetInfo.targetType}Id`;

    // @ts-expect-error - This is okay for morph
    linkedActivity[targetIdKey] = targetInfo.targetId;

    // Only set activity ID for entities that have corresponding columns
    const entitiesWithColumns = new Set(['note', 'task']);

    if (entitiesWithColumns.has(activityType)) {
      const activityIdKey = `${activityType}Id`;

      // @ts-expect-error - This is okay for morph
      linkedActivity[activityIdKey] = recordSeed.id;
    }

    return linkedActivity;
  }

  private getLinkedRecordData(
    activityType: string,
    recordSeed: Record<string, unknown>,
    index: number,
  ): {
    linkedRecordCachedName: string;
    linkedProperties: Record<string, unknown>;
  } {
    const baseProperties = { id: recordSeed.id };

    const dataGetters = {
      calendarEvent: () => ({
        linkedRecordCachedName: String(
          recordSeed.title || `Calendar Event ${index + 1}`,
        ),
        linkedProperties: {
          ...baseProperties,
          title: recordSeed.title,
          description: recordSeed.description,
          startsAt: recordSeed.startsAt,
          endsAt: recordSeed.endsAt,
        },
      }),
      message: () => ({
        linkedRecordCachedName: String(
          recordSeed.subject || `Message ${index + 1}`,
        ),
        linkedProperties: {
          ...baseProperties,
          subject: recordSeed.subject,
          text: recordSeed.text,
          receivedAt: recordSeed.receivedAt,
        },
      }),
      default: () => ({
        linkedRecordCachedName: String(
          recordSeed.title || `${activityType} ${index + 1}`,
        ),
        linkedProperties: {
          ...baseProperties,
          title: recordSeed.title,
          body: recordSeed.body,
        },
      }),
    };

    const getter =
      dataGetters[activityType as keyof typeof dataGetters] ||
      dataGetters.default;

    return getter();
  }

  private generateLinkedTimelineActivityId(
    type: string,
    targetType: string,
    index: number,
  ): string {
    const prefix = '20202020';
    const entityCode =
      this.ENTITY_CODES[type as keyof typeof this.ENTITY_CODES] || '0000';
    const targetCode =
      this.TARGET_CODES[targetType as keyof typeof this.TARGET_CODES] || '0000';
    // Ensure the last segment is exactly 12 hex characters
    const indexHex = (index % 0xffffffff).toString(16).padStart(8, '0');

    return `${prefix}-${entityCode}-${targetCode}-8001-${indexHex}0001`;
  }

  private async getObjectMetadataIds(
    workspaceId: string,
  ): Promise<ObjectMetadataIds> {
    const metadataQueries = [
      { name: 'note', key: 'noteMetadataId' },
      { name: 'task', key: 'taskMetadataId' },
      { name: 'calendarEvent', key: 'calendarEventMetadataId' },
      { name: 'message', key: 'messageMetadataId' },
    ];

    const metadataResults = await Promise.all(
      metadataQueries.map(({ name }) =>
        this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
          where: { nameSingular: name },
        }),
      ),
    );

    const missingMetadata = metadataResults
      .map((result, index) => (result ? null : metadataQueries[index].name))
      .filter(Boolean);

    if (missingMetadata.length > 0) {
      throw new Error(
        `Could not find metadata for: ${missingMetadata.join(', ')}`,
      );
    }

    return {
      noteMetadataId: metadataResults[0]?.id || '',
      taskMetadataId: metadataResults[1]?.id || '',
      calendarEventMetadataId: metadataResults[2]?.id || '',
      messageMetadataId: metadataResults[3]?.id || '',
    };
  }
}
