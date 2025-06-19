import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { COMPANY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { NOTE_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import { NOTE_TARGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-target-data-seeds.constant';
import { OPPORTUNITY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { TASK_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';
import { TASK_TARGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-target-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

// Seeding-specific type based on TimelineActivityWorkspaceEntity for raw data insertion
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
  activityType: 'note' | 'task';
  recordSeed: Record<string, unknown>;
  index: number;
  activityIndex: number;
  linkedObjectMetadataId: string;
  targetInfo: ActivityTargetInfo;
};

@Injectable()
export class TimelineActivitySeederService {
  constructor(private readonly objectMetadataService: ObjectMetadataService) {}

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

    const { noteMetadataId, taskMetadataId } =
      await this.getObjectMetadataIds(workspaceId);

    let activityIndex = 0;

    const entityConfigs = [
      { type: 'company', seeds: COMPANY_DATA_SEEDS },
      { type: 'person', seeds: PERSON_DATA_SEEDS },
      { type: 'note', seeds: NOTE_DATA_SEEDS },
      { type: 'task', seeds: TASK_DATA_SEEDS },
      { type: 'opportunity', seeds: OPPORTUNITY_DATA_SEEDS },
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

        // For notes and tasks, create additional linked timeline activities on target objects
        if (type === 'note' || type === 'task') {
          const linkedObjectMetadataId =
            type === 'note' ? noteMetadataId : taskMetadataId;
          const linkedActivities = this.computeLinkedTimelineActivityRecords({
            activityType: type,
            recordSeed: seed,
            index,
            activityIndex,
            linkedObjectMetadataId,
          });

          timelineActivities.push(...linkedActivities);
          activityIndex += linkedActivities.length;
        }
      });
    });

    if (timelineActivities.length > 0) {
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
  }

  private createTimelineActivity({
    entityType,
    recordSeed,
    index,
  }: CreateTimelineActivityParams): TimelineActivitySeedData {
    const generateTimelineActivityId = (type: string, idx: number): string => {
      const prefix = '20202020';
      const entityCodes: Record<string, string> = {
        company: '0001',
        person: '0201',
        note: '0601',
        task: '0651',
        opportunity: '0851',
      };
      const code = entityCodes[type] || '0000';
      const paddedIndex = String(idx).padStart(4, '0');

      return `${prefix}-${code}-4000-8001-${paddedIndex}00000001`;
    };

    const creationDate = new Date().toISOString();

    const timelineActivity: TimelineActivitySeedData = {
      id: generateTimelineActivityId(entityType, index + 1),
      name: `${entityType}.created`,
      properties: JSON.stringify({
        after: this.getEventAfterRecordProperties({
          type: entityType,
          recordSeed,
        }),
      }),
      linkedRecordCachedName: '',
      linkedRecordId: recordSeed.id as string,
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

    // @ts-expect-error - This is okay for morph
    // alternative is to be explicit but that makes
    timelineActivity[`${entityType}Id`] = recordSeed.id;

    return timelineActivity;
  }

  private getEventAfterRecordProperties({
    type,
    recordSeed,
  }: {
    type: string;
    recordSeed: Record<string, unknown>;
  }): Record<string, unknown> {
    const commonProperties = {
      id: recordSeed.id,
    };

    switch (type) {
      case 'company':
        return {
          ...commonProperties,
          name: recordSeed.name,
          domainName: recordSeed.domainNamePrimaryLinkUrl,
          employees: recordSeed.employees,
          city: recordSeed.addressAddressCity,
        };
      case 'person':
        return {
          ...commonProperties,
          name: {
            firstName: recordSeed.nameFirstName,
            lastName: recordSeed.nameLastName,
          },
          email: recordSeed.emailsPrimaryEmail,
          jobTitle: recordSeed.jobTitle,
        };
      case 'note':
        return {
          ...commonProperties,
          title: recordSeed.title,
          body: recordSeed.body,
        };
      case 'task':
        return {
          ...commonProperties,
          title: recordSeed.title,
          body: recordSeed.body,
          status: recordSeed.status,
          dueAt: recordSeed.dueAt,
        };
      case 'opportunity':
        return {
          ...commonProperties,
          name: recordSeed.name,
          amount: recordSeed.amountAmountMicros,
          stage: recordSeed.stage,
          closeDate: recordSeed.closeDate,
        };
      default:
        return commonProperties;
    }
  }

  private computeLinkedTimelineActivityRecords({
    activityType,
    recordSeed,
    index,
    activityIndex,
    linkedObjectMetadataId,
  }: {
    activityType: 'note' | 'task';
    recordSeed: Record<string, unknown>;
    index: number;
    activityIndex: number;
    linkedObjectMetadataId: string;
  }): TimelineActivitySeedData[] {
    const targetInfo = this.getActivityTargetInfo({
      activityType,
      recordSeed,
    });

    if (!targetInfo) {
      return [];
    }

    const linkedActivity = this.computeLinkedActivityRecord({
      activityType,
      recordSeed,
      index,
      activityIndex,
      linkedObjectMetadataId,
      targetInfo,
    });

    return [linkedActivity];
  }

  private getActivityTargetInfo({
    activityType,
    recordSeed,
  }: {
    activityType: 'note' | 'task';
    recordSeed: Record<string, unknown>;
  }): ActivityTargetInfo | null {
    if (activityType === 'note') {
      const noteTargetSeed = NOTE_TARGET_DATA_SEEDS.find(
        (target) => target.noteId === recordSeed.id,
      );

      if (!noteTargetSeed) {
        return null;
      }

      if (noteTargetSeed.personId) {
        return {
          targetType: 'person',
          targetId: noteTargetSeed.personId,
        };
      }

      if (noteTargetSeed.companyId) {
        return {
          targetType: 'company',
          targetId: noteTargetSeed.companyId,
        };
      }

      if (noteTargetSeed.opportunityId) {
        return {
          targetType: 'opportunity',
          targetId: noteTargetSeed.opportunityId,
        };
      }
    }

    if (activityType === 'task') {
      const taskTargetSeed = TASK_TARGET_DATA_SEEDS.find(
        (target) => target.taskId === recordSeed.id,
      );

      if (!taskTargetSeed) {
        return null;
      }

      if (taskTargetSeed.personId) {
        return {
          targetType: 'person',
          targetId: taskTargetSeed.personId,
        };
      }

      if (taskTargetSeed.companyId) {
        return {
          targetType: 'company',
          targetId: taskTargetSeed.companyId,
        };
      }

      if (taskTargetSeed.opportunityId) {
        return {
          targetType: 'opportunity',
          targetId: taskTargetSeed.opportunityId,
        };
      }
    }

    return null;
  }

  private computeLinkedActivityRecord({
    activityType,
    recordSeed,
    index,
    activityIndex,
    linkedObjectMetadataId,
    targetInfo,
  }: CreateLinkedActivityParams): TimelineActivitySeedData {
    const generateLinkedTimelineActivityId = (
      type: string,
      targetType: string,
      idx: number,
    ): string => {
      const prefix = '20202020';

      const entityCodes: Record<string, string> = {
        note: '0601',
        task: '0651',
      };
      const targetCodes: Record<string, string> = {
        person: '1001',
        company: '2001',
        opportunity: '3001',
      };
      const entityCode = entityCodes[type] || '0000';
      const targetCode = targetCodes[targetType] || '0000';
      const paddedIndex = idx.toString().padStart(4, '0');

      return `${prefix}-${entityCode}-${targetCode}-8001-${paddedIndex}00000001`;
    };

    const creationDate = new Date().toISOString();

    const linkedActivity: TimelineActivitySeedData = {
      id: generateLinkedTimelineActivityId(
        activityType,
        targetInfo.targetType,
        activityIndex,
      ),
      name: `linked-${activityType}.created`,
      properties: JSON.stringify({
        after: {
          id: recordSeed.id,
          title: recordSeed.title,
          body: recordSeed.body,
        },
      }),
      linkedRecordCachedName:
        (recordSeed.title as string) || `${activityType} ${index + 1}`,
      linkedRecordId: recordSeed.id as string,
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

    // @ts-expect-error - This is okay for morph
    // alternative is to be explicit but it's very verbose
    linkedActivity[`${targetInfo.targetType}Id`] = targetInfo.targetId;
    // @ts-expect-error - This is okay for morph
    linkedActivity[`${activityType}Id`] = recordSeed.id;

    return linkedActivity;
  }

  private async getObjectMetadataIds(workspaceId: string): Promise<{
    noteMetadataId: string;
    taskMetadataId: string;
  }> {
    const noteMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: 'note' },
      });

    const taskMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: 'task' },
      });

    if (!noteMetadata || !taskMetadata) {
      throw new Error('Could not find note or task metadata');
    }

    return {
      noteMetadataId: noteMetadata.id,
      taskMetadataId: taskMetadata.id,
    };
  }
}
