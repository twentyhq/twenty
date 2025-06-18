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
    const timelineActivities: Record<string, unknown>[] = [];

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
        const activity = this.createTimelineActivity(type, seed, index);

        timelineActivities.push(activity);
        activityIndex++;

        // For notes and tasks, create additional linked timeline activities on target objects
        if (type === 'note' || type === 'task') {
          const linkedObjectMetadataId =
            type === 'note' ? noteMetadataId : taskMetadataId;
          const linkedActivities = this.createLinkedTimelineActivities(
            type,
            seed,
            index,
            activityIndex,
            linkedObjectMetadataId,
          );

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

  private createTimelineActivity(
    entityType: string,
    entitySeed: Record<string, unknown>,
    index: number,
  ): Record<string, unknown> {
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

    const timelineActivity: Record<string, unknown> = {
      id: generateTimelineActivityId(entityType, index + 1),
      name: `${entityType}.created`,
      properties: JSON.stringify({
        after: this.getEntityProperties(entityType, entitySeed),
      }),
      linkedRecordCachedName: '',
      linkedRecordId: entitySeed.id,
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

    timelineActivity[`${entityType}Id`] = entitySeed.id;

    return timelineActivity;
  }

  private getEntityProperties(
    type: string,
    seed: Record<string, unknown>,
  ): Record<string, unknown> {
    const commonProperties = {
      id: seed.id,
    };

    switch (type) {
      case 'company':
        return {
          ...commonProperties,
          name: seed.name,
          domainName: seed.domainNamePrimaryLinkUrl,
          employees: seed.employees,
          city: seed.addressAddressCity,
        };
      case 'person':
        return {
          ...commonProperties,
          name: {
            firstName: seed.nameFirstName,
            lastName: seed.nameLastName,
          },
          email: seed.emailsPrimaryEmail,
          jobTitle: seed.jobTitle,
        };
      case 'note':
        return {
          ...commonProperties,
          title: seed.title,
          body: seed.body,
        };
      case 'task':
        return {
          ...commonProperties,
          title: seed.title,
          body: seed.body,
          status: seed.status,
          dueAt: seed.dueAt,
        };
      case 'opportunity':
        return {
          ...commonProperties,
          name: seed.name,
          amount: seed.amountAmountMicros,
          stage: seed.stage,
          closeDate: seed.closeDate,
        };
      default:
        return commonProperties;
    }
  }

  private createLinkedTimelineActivities(
    entityType: 'note' | 'task',
    entitySeed: Record<string, unknown>,
    index: number,
    activityIndex: number,
    linkedObjectMetadataId: string,
  ): Record<string, unknown>[] {
    const targetInfo = this.getTargetInfo(entityType, entitySeed);

    if (!targetInfo) {
      return [];
    }

    const linkedActivity = this.createLinkedActivity(
      entityType,
      entitySeed,
      index,
      activityIndex,
      linkedObjectMetadataId,
      targetInfo,
    );

    return [linkedActivity];
  }

  private getTargetInfo(
    entityType: 'note' | 'task',
    entitySeed: Record<string, unknown>,
  ): {
    targetType: string;
    targetId: string;
  } | null {
    if (entityType === 'note') {
      const noteTargetSeed = NOTE_TARGET_DATA_SEEDS.find(
        (target) => target.noteId === entitySeed.id,
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

    if (entityType === 'task') {
      const taskTargetSeed = TASK_TARGET_DATA_SEEDS.find(
        (target) => target.taskId === entitySeed.id,
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

  private createLinkedActivity(
    entityType: 'note' | 'task',
    entitySeed: Record<string, unknown>,
    index: number,
    activityIndex: number,
    linkedObjectMetadataId: string,
    targetInfo: {
      targetType: string;
      targetId: string;
    },
  ): Record<string, unknown> {
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

    const linkedActivity: Record<string, unknown> = {
      id: generateLinkedTimelineActivityId(
        entityType,
        targetInfo.targetType,
        activityIndex,
      ),
      name: `linked-${entityType}.created`,
      properties: JSON.stringify({
        after: {
          id: entitySeed.id,
          title: entitySeed.title,
          body: entitySeed.body,
        },
      }),
      linkedRecordCachedName:
        (entitySeed.title as string) || `${entityType} ${index + 1}`,
      linkedRecordId: entitySeed.id,
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

    linkedActivity[`${targetInfo.targetType}Id`] = targetInfo.targetId;
    linkedActivity[`${entityType}Id`] = entitySeed.id;

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
