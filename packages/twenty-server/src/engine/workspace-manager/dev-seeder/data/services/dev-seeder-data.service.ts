import { Injectable } from '@nestjs/common';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  API_KEY_DATA_SEED_COLUMNS,
  API_KEY_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import {
  CALENDAR_CHANNEL_DATA_SEED_COLUMNS,
  CALENDAR_CHANNEL_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-channel-data-seeds.constant';
import {
  CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_COLUMNS,
  CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-channel-event-association-data-seeds.constant';
import {
  CALENDAR_EVENT_DATA_SEED_COLUMNS,
  CALENDAR_EVENT_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-data-seeds.constant';
import {
  CALENDAR_EVENT_PARTICIPANT_DATA_SEED_COLUMNS,
  CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-participant-data-seeds.constant';
import {
  COMPANY_DATA_SEED_COLUMNS,
  COMPANY_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import {
  CONNECTED_ACCOUNT_DATA_SEED_COLUMNS,
  CONNECTED_ACCOUNT_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import {
  MESSAGE_CHANNEL_DATA_SEED_COLUMNS,
  MESSAGE_CHANNEL_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';
import {
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_COLUMNS,
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-message-association-data-seeds.constant';
import {
  MESSAGE_DATA_SEED_COLUMNS,
  MESSAGE_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/message-data-seeds.constant';
import {
  MESSAGE_PARTICIPANT_DATA_SEED_COLUMNS,
  MESSAGE_PARTICIPANT_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/message-participant-data-seeds.constant';
import {
  MESSAGE_THREAD_DATA_SEED_COLUMNS,
  MESSAGE_THREAD_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/message-thread-data-seeds.constant';
import {
  NOTE_DATA_SEED_COLUMNS,
  NOTE_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import {
  NOTE_TARGET_DATA_SEED_COLUMNS,
  NOTE_TARGET_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/note-target-data-seeds.constant';
import {
  OPPORTUNITY_DATA_SEED_COLUMNS,
  OPPORTUNITY_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import {
  PERSON_DATA_SEED_COLUMNS,
  PERSON_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import {
  PET_DATA_SEED_COLUMNS,
  PET_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/pet-data-seeds.constant';
import {
  SURVEY_RESULT_DATA_SEED_COLUMNS,
  SURVEY_RESULT_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/survey-result-data-seeds.constant';
import {
  TASK_DATA_SEED_COLUMNS,
  TASK_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';
import {
  TASK_TARGET_DATA_SEED_COLUMNS,
  TASK_TARGET_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/task-target-data-seeds.constant';
import {
  WORKFLOW_DATA_SEED_COLUMNS,
  WORKFLOW_DATA_SEEDS,
  WORKFLOW_VERSION_DATA_SEED_COLUMNS,
  WORKFLOW_VERSION_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/workflow-data-seeds.constants';
import {
  WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
  WORKSPACE_MEMBER_DATA_SEED_IDS,
  WORKSPACE_MEMBER_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { prefillViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-views';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';

const RECORD_SEEDS_CONFIGS = [
  {
    tableName: 'workspaceMember',
    pgColumns: WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
    recordSeeds: WORKSPACE_MEMBER_DATA_SEEDS,
  },
  {
    tableName: 'company',
    pgColumns: COMPANY_DATA_SEED_COLUMNS,
    recordSeeds: COMPANY_DATA_SEEDS,
  },
  {
    tableName: 'person',
    pgColumns: PERSON_DATA_SEED_COLUMNS,
    recordSeeds: PERSON_DATA_SEEDS,
  },
  {
    tableName: 'note',
    pgColumns: NOTE_DATA_SEED_COLUMNS,
    recordSeeds: NOTE_DATA_SEEDS,
  },
  {
    tableName: 'noteTarget',
    pgColumns: NOTE_TARGET_DATA_SEED_COLUMNS,
    recordSeeds: NOTE_TARGET_DATA_SEEDS,
  },
  {
    tableName: 'opportunity',
    pgColumns: OPPORTUNITY_DATA_SEED_COLUMNS,
    recordSeeds: OPPORTUNITY_DATA_SEEDS,
  },
  {
    tableName: 'apiKey',
    pgColumns: API_KEY_DATA_SEED_COLUMNS,
    recordSeeds: API_KEY_DATA_SEEDS,
  },
  {
    tableName: 'connectedAccount',
    pgColumns: CONNECTED_ACCOUNT_DATA_SEED_COLUMNS,
    recordSeeds: CONNECTED_ACCOUNT_DATA_SEEDS,
  },
  {
    tableName: 'calendarChannel',
    pgColumns: CALENDAR_CHANNEL_DATA_SEED_COLUMNS,
    recordSeeds: CALENDAR_CHANNEL_DATA_SEEDS,
  },
  {
    tableName: 'calendarEvent',
    pgColumns: CALENDAR_EVENT_DATA_SEED_COLUMNS,
    recordSeeds: CALENDAR_EVENT_DATA_SEEDS,
  },
  {
    tableName: 'calendarChannelEventAssociation',
    pgColumns: CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_COLUMNS,
    recordSeeds: CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEEDS,
  },
  {
    tableName: 'calendarEventParticipant',
    pgColumns: CALENDAR_EVENT_PARTICIPANT_DATA_SEED_COLUMNS,
    recordSeeds: CALENDAR_EVENT_PARTICIPANT_DATA_SEEDS,
  },
  {
    tableName: 'messageChannel',
    pgColumns: MESSAGE_CHANNEL_DATA_SEED_COLUMNS,
    recordSeeds: MESSAGE_CHANNEL_DATA_SEEDS,
  },
  {
    tableName: 'messageThread',
    pgColumns: MESSAGE_THREAD_DATA_SEED_COLUMNS,
    recordSeeds: MESSAGE_THREAD_DATA_SEEDS,
  },
  {
    tableName: 'message',
    pgColumns: MESSAGE_DATA_SEED_COLUMNS,
    recordSeeds: MESSAGE_DATA_SEEDS,
  },
  {
    tableName: 'messageChannelMessageAssociation',
    pgColumns: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_COLUMNS,
    recordSeeds: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEEDS,
  },
  {
    tableName: 'messageParticipant',
    pgColumns: MESSAGE_PARTICIPANT_DATA_SEED_COLUMNS,
    recordSeeds: MESSAGE_PARTICIPANT_DATA_SEEDS,
  },
  {
    tableName: 'workflow',
    pgColumns: WORKFLOW_DATA_SEED_COLUMNS,
    recordSeeds: WORKFLOW_DATA_SEEDS,
  },
  {
    tableName: 'workflowVersion',
    pgColumns: WORKFLOW_VERSION_DATA_SEED_COLUMNS,
    recordSeeds: WORKFLOW_VERSION_DATA_SEEDS,
  },
  {
    tableName: '_pet',
    pgColumns: PET_DATA_SEED_COLUMNS,
    recordSeeds: PET_DATA_SEEDS,
  },
  {
    tableName: '_surveyResult',
    pgColumns: SURVEY_RESULT_DATA_SEED_COLUMNS,
    recordSeeds: SURVEY_RESULT_DATA_SEEDS,
  },
  {
    tableName: 'task',
    pgColumns: TASK_DATA_SEED_COLUMNS,
    recordSeeds: TASK_DATA_SEEDS,
  },
  {
    tableName: 'taskTarget',
    pgColumns: TASK_TARGET_DATA_SEED_COLUMNS,
    recordSeeds: TASK_TARGET_DATA_SEEDS,
  },
];

@Injectable()
export class DevSeederDataService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  public async seed({
    schemaName,
    workspaceId,
  }: {
    schemaName: string;
    workspaceId: string;
  }) {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await mainDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        for (const recordSeedsConfig of RECORD_SEEDS_CONFIGS) {
          await this.seedRecords({
            entityManager,
            schemaName,
            tableName: recordSeedsConfig.tableName,
            pgColumns: recordSeedsConfig.pgColumns,
            recordSeeds: recordSeedsConfig.recordSeeds,
          });
        }

        await this.seedTimelineActivities({
          entityManager,
          schemaName,
          workspaceId,
        });

        const viewDefinitionsWithId = await prefillViews(
          entityManager,
          schemaName,
          objectMetadataItems,
        );

        await prefillWorkspaceFavorites(
          viewDefinitionsWithId
            .filter(
              (view) =>
                view.key === 'INDEX' &&
                shouldSeedWorkspaceFavorite(
                  view.objectMetadataId,
                  objectMetadataItems,
                ),
            )
            .map((view) => view.id),
          entityManager,
          schemaName,
        );
      },
    );
  }

  private async seedRecords({
    entityManager,
    schemaName,
    tableName,
    pgColumns,
    recordSeeds,
  }: {
    entityManager: WorkspaceEntityManager;
    schemaName: string;
    tableName: string;
    pgColumns: string[];
    recordSeeds: Record<string, unknown>[];
  }) {
    await entityManager
      .createQueryBuilder(undefined, undefined, undefined, {
        shouldBypassPermissionChecks: true,
      })
      .insert()
      .into(`${schemaName}.${tableName}`, pgColumns)
      .orIgnore()
      .values(recordSeeds)
      .returning('*')
      .execute();
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

    const getDisplayName = (
      type: string,
      seed: Record<string, unknown>,
      idx: number,
    ): string => {
      switch (type) {
        case 'company':
          return (seed.name as string) || `Company ${idx + 1}`;
        case 'person': {
          const firstName = (seed.nameFirstName as string) || '';
          const lastName = (seed.nameLastName as string) || '';

          return `${firstName} ${lastName}`.trim() || `Person ${idx + 1}`;
        }
        case 'note':
          return (seed.title as string) || `Note ${idx + 1}`;
        case 'task':
          return (seed.title as string) || `Task ${idx + 1}`;
        case 'opportunity':
          return (seed.name as string) || `Opportunity ${idx + 1}`;
        default:
          return `${type.charAt(0).toUpperCase() + type.slice(1)} ${idx + 1}`;
      }
    };

    const getProperties = (
      type: string,
      seed: Record<string, unknown>,
    ): Record<string, unknown> => {
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
    };

    const creationDate = new Date().toISOString();

    const timelineActivity: Record<string, unknown> = {
      id: generateTimelineActivityId(entityType, index + 1),
      name: `${entityType}.created`,
      properties: JSON.stringify({
        after: getProperties(entityType, entitySeed),
      }),
      linkedRecordCachedName: getDisplayName(entityType, entitySeed, index),
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

  private createLinkedTimelineActivities(
    entityType: 'note' | 'task',
    entitySeed: Record<string, unknown>,
    index: number,
    activityIndex: number,
    linkedObjectMetadataId: string,
  ): Record<string, unknown>[] {
    const linkedActivities: Record<string, unknown>[] = [];

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

    let targetInfo: {
      targetType: string;
      targetId: string;
      targetName: string;
    } | null = null;

    if (entityType === 'note') {
      const noteTargetSeed = NOTE_TARGET_DATA_SEEDS.find(
        (target) => target.noteId === entitySeed.id,
      );

      if (noteTargetSeed) {
        if (noteTargetSeed.personId) {
          const personSeed = PERSON_DATA_SEEDS.find(
            (p) => p.id === noteTargetSeed.personId,
          );

          targetInfo = {
            targetType: 'person',
            targetId: noteTargetSeed.personId,
            targetName: personSeed
              ? `${personSeed.nameFirstName || ''} ${personSeed.nameLastName || ''}`.trim()
              : 'Unknown Person',
          };
        } else if (noteTargetSeed.companyId) {
          const companySeed = COMPANY_DATA_SEEDS.find(
            (c) => c.id === noteTargetSeed.companyId,
          );

          targetInfo = {
            targetType: 'company',
            targetId: noteTargetSeed.companyId,
            targetName: (companySeed?.name as string) || 'Unknown Company',
          };
        } else if (noteTargetSeed.opportunityId) {
          const opportunitySeed = OPPORTUNITY_DATA_SEEDS.find(
            (o) => o.id === noteTargetSeed.opportunityId,
          );

          targetInfo = {
            targetType: 'opportunity',
            targetId: noteTargetSeed.opportunityId,
            targetName:
              (opportunitySeed?.name as string) || 'Unknown Opportunity',
          };
        }
      }
    } else if (entityType === 'task') {
      const taskTargetSeed = TASK_TARGET_DATA_SEEDS.find(
        (target) => target.taskId === entitySeed.id,
      );

      if (taskTargetSeed) {
        if (taskTargetSeed.personId) {
          const personSeed = PERSON_DATA_SEEDS.find(
            (p) => p.id === taskTargetSeed.personId,
          );

          targetInfo = {
            targetType: 'person',
            targetId: taskTargetSeed.personId,
            targetName: personSeed
              ? `${personSeed.nameFirstName || ''} ${personSeed.nameLastName || ''}`.trim()
              : 'Unknown Person',
          };
        } else if (taskTargetSeed.companyId) {
          const companySeed = COMPANY_DATA_SEEDS.find(
            (c) => c.id === taskTargetSeed.companyId,
          );

          targetInfo = {
            targetType: 'company',
            targetId: taskTargetSeed.companyId,
            targetName: (companySeed?.name as string) || 'Unknown Company',
          };
        } else if (taskTargetSeed.opportunityId) {
          const opportunitySeed = OPPORTUNITY_DATA_SEEDS.find(
            (o) => o.id === taskTargetSeed.opportunityId,
          );

          targetInfo = {
            targetType: 'opportunity',
            targetId: taskTargetSeed.opportunityId,
            targetName:
              (opportunitySeed?.name as string) || 'Unknown Opportunity',
          };
        }
      }
    }

    if (targetInfo) {
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

      // Set the appropriate target field
      linkedActivity[`${targetInfo.targetType}Id`] = targetInfo.targetId;
      linkedActivity[`${entityType}Id`] = entitySeed.id;

      linkedActivities.push(linkedActivity);
    }

    return linkedActivities;
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

  private async seedTimelineActivities({
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

      for (let i = 0; i < timelineActivities.length; i += batchSize) {
        const batch = timelineActivities.slice(i, i + batchSize);

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
}
