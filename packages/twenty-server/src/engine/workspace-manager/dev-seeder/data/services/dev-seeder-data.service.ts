import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
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
  getCalendarEventParticipantDataSeeds,
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
  DASHBOARD_DATA_SEED_COLUMNS,
  DASHBOARD_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/dashboard-data-seeds.constant';
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
  getMessageParticipantDataSeeds,
  MESSAGE_PARTICIPANT_DATA_SEED_COLUMNS,
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
  getWorkspaceMemberDataSeeds,
  WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { TimelineActivitySeederService } from 'src/engine/workspace-manager/dev-seeder/data/services/timeline-activity-seeder.service';
import { prefillWorkflows } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workflows';

const getRecordSeedsConfigs = (
  workspaceId: string,
  featureFlags?: Record<FeatureFlagKey, boolean>,
) => [
  {
    tableName: 'workspaceMember',
    pgColumns: WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
    recordSeeds: getWorkspaceMemberDataSeeds(workspaceId),
  },
  {
    tableName: 'company',
    pgColumns: COMPANY_DATA_SEED_COLUMNS,
    recordSeeds: COMPANY_DATA_SEEDS,
  },
  ...(featureFlags?.[FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED]
    ? [
        {
          tableName: 'dashboard',
          pgColumns: DASHBOARD_DATA_SEED_COLUMNS,
          recordSeeds: DASHBOARD_DATA_SEEDS,
        },
      ]
    : []),
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
    recordSeeds: getCalendarEventParticipantDataSeeds(workspaceId),
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
    recordSeeds: getMessageParticipantDataSeeds(workspaceId),
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
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly timelineActivitySeederService: TimelineActivitySeederService,
  ) {}

  public async seed({
    schemaName,
    workspaceId,
    featureFlags,
  }: {
    schemaName: string;
    workspaceId: string;
    featureFlags?: Record<FeatureFlagKey, boolean>;
  }) {
    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await this.coreDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        for (const recordSeedsConfig of getRecordSeedsConfigs(
          workspaceId,
          featureFlags,
        )) {
          const objectMetadata = objectMetadataItems.find(
            (item) =>
              computeTableName(item.nameSingular, item.isCustom) ===
              recordSeedsConfig.tableName,
          );

          if (!objectMetadata) {
            continue;
          }

          await this.seedRecords({
            entityManager,
            schemaName,
            tableName: recordSeedsConfig.tableName,
            pgColumns: recordSeedsConfig.pgColumns,
            recordSeeds: recordSeedsConfig.recordSeeds,
          });
        }

        await this.timelineActivitySeederService.seedTimelineActivities({
          entityManager,
          schemaName,
          workspaceId,
        });

        await prefillWorkflows(entityManager, schemaName, objectMetadataItems);
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
}
