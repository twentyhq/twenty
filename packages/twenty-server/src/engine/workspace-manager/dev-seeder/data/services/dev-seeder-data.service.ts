import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { readFile } from 'fs/promises';
import { join } from 'path';

import { DataSource } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import {
  ATTACHMENT_DATA_SEED_COLUMNS,
  ATTACHMENT_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/attachment-data-seeds.constant';
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
  getDashboardDataSeeds,
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
  ROCKET_DATA_SEED_COLUMNS,
  ROCKET_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/rocket-data-seeds.constant';
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

type RecordSeedConfig = {
  tableName: string;
  pgColumns: string[];
  recordSeeds: Record<string, unknown>[];
};

// Organize seeds into dependency batches for parallel insertion
const getRecordSeedsBatches = (
  workspaceId: string,
  _featureFlags?: Record<FeatureFlagKey, boolean>,
): RecordSeedConfig[][] => {
  // Batch 1: No dependencies
  const batch1: RecordSeedConfig[] = [
    {
      tableName: 'workspaceMember',
      pgColumns: WORKSPACE_MEMBER_DATA_SEED_COLUMNS,
      recordSeeds: getWorkspaceMemberDataSeeds(workspaceId),
    },
    {
      tableName: '_surveyResult',
      pgColumns: SURVEY_RESULT_DATA_SEED_COLUMNS,
      recordSeeds: SURVEY_RESULT_DATA_SEEDS,
    },
    {
      tableName: '_rocket',
      pgColumns: ROCKET_DATA_SEED_COLUMNS,
      recordSeeds: ROCKET_DATA_SEEDS,
    },
  ];

  // Batch 2: Depends on workspaceMember
  const batch2: RecordSeedConfig[] = [
    {
      tableName: 'company',
      pgColumns: COMPANY_DATA_SEED_COLUMNS,
      recordSeeds: COMPANY_DATA_SEEDS,
    },
    {
      tableName: 'connectedAccount',
      pgColumns: CONNECTED_ACCOUNT_DATA_SEED_COLUMNS,
      recordSeeds: CONNECTED_ACCOUNT_DATA_SEEDS,
    },
    {
      tableName: 'dashboard',
      pgColumns: DASHBOARD_DATA_SEED_COLUMNS,
      recordSeeds: getDashboardDataSeeds(workspaceId),
    },
  ];

  // Batch 3: Depends on company and connectedAccount
  const batch3: RecordSeedConfig[] = [
    {
      tableName: 'person',
      pgColumns: PERSON_DATA_SEED_COLUMNS,
      recordSeeds: PERSON_DATA_SEEDS,
    },
    {
      tableName: '_pet',
      pgColumns: PET_DATA_SEED_COLUMNS,
      recordSeeds: PET_DATA_SEEDS,
    },
    {
      tableName: 'calendarChannel',
      pgColumns: CALENDAR_CHANNEL_DATA_SEED_COLUMNS,
      recordSeeds: CALENDAR_CHANNEL_DATA_SEEDS,
    },
    {
      tableName: 'messageChannel',
      pgColumns: MESSAGE_CHANNEL_DATA_SEED_COLUMNS,
      recordSeeds: MESSAGE_CHANNEL_DATA_SEEDS,
    },
  ];

  // Batch 4: Depends on person/company or independent
  const batch4: RecordSeedConfig[] = [
    {
      tableName: 'opportunity',
      pgColumns: OPPORTUNITY_DATA_SEED_COLUMNS,
      recordSeeds: OPPORTUNITY_DATA_SEEDS,
    },
    {
      tableName: 'note',
      pgColumns: NOTE_DATA_SEED_COLUMNS,
      recordSeeds: NOTE_DATA_SEEDS,
    },
    {
      tableName: 'task',
      pgColumns: TASK_DATA_SEED_COLUMNS,
      recordSeeds: TASK_DATA_SEEDS,
    },
    {
      tableName: 'calendarEvent',
      pgColumns: CALENDAR_EVENT_DATA_SEED_COLUMNS,
      recordSeeds: CALENDAR_EVENT_DATA_SEEDS,
    },
    {
      tableName: 'messageThread',
      pgColumns: MESSAGE_THREAD_DATA_SEED_COLUMNS,
      recordSeeds: MESSAGE_THREAD_DATA_SEEDS,
    },
  ];

  // Batch 5: Depends on batch 4 entities
  const batch5: RecordSeedConfig[] = [
    {
      tableName: 'noteTarget',
      pgColumns: NOTE_TARGET_DATA_SEED_COLUMNS,
      recordSeeds: NOTE_TARGET_DATA_SEEDS,
    },
    {
      tableName: 'taskTarget',
      pgColumns: TASK_TARGET_DATA_SEED_COLUMNS,
      recordSeeds: TASK_TARGET_DATA_SEEDS,
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
      tableName: 'message',
      pgColumns: MESSAGE_DATA_SEED_COLUMNS,
      recordSeeds: MESSAGE_DATA_SEEDS,
    },
  ];

  // Batch 6: Depends on batch 5 entities
  const batch6: RecordSeedConfig[] = [
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
      tableName: 'attachment',
      pgColumns: ATTACHMENT_DATA_SEED_COLUMNS,
      recordSeeds: ATTACHMENT_DATA_SEEDS,
    },
  ];

  return [batch1, batch2, batch3, batch4, batch5, batch6];
};

@Injectable()
export class DevSeederDataService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly timelineActivitySeederService: TimelineActivitySeederService,
    private readonly fileStorageService: FileStorageService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    await this.coreDataSource.transaction(
      async (entityManager: WorkspaceEntityManager) => {
        await this.seedRecordsInBatches({
          entityManager,
          schemaName,
          workspaceId,
          featureFlags,
          objectMetadataItems,
        });

        await this.timelineActivitySeederService.seedTimelineActivities({
          entityManager,
          schemaName,
          workspaceId,
        });

        await this.seedAttachmentFiles(workspaceId);

        await prefillWorkflows(
          entityManager,
          schemaName,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );
      },
    );
  }

  private async seedRecordsInBatches({
    entityManager,
    schemaName,
    workspaceId,
    featureFlags,
    objectMetadataItems,
  }: {
    entityManager: WorkspaceEntityManager;
    schemaName: string;
    workspaceId: string;
    featureFlags?: Record<FeatureFlagKey, boolean>;
    objectMetadataItems: FlatObjectMetadata[];
  }) {
    const batches = getRecordSeedsBatches(workspaceId, featureFlags);

    // Process batches sequentially (respecting dependencies)
    // but entities within each batch in parallel
    for (const batch of batches) {
      await Promise.all(
        batch.map(async (recordSeedsConfig) => {
          const objectMetadata = objectMetadataItems.find(
            (item) =>
              computeTableName(item.nameSingular, item.isCustom) ===
              recordSeedsConfig.tableName,
          );

          if (!objectMetadata) {
            // TODO this continue is hacky, we should have a record seed config per workspace
            return;
          }

          await this.seedRecords({
            entityManager,
            schemaName,
            tableName: recordSeedsConfig.tableName,
            pgColumns: recordSeedsConfig.pgColumns,
            recordSeeds: recordSeedsConfig.recordSeeds,
          });
        }),
      );
    }
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
      .execute();
  }

  private async seedAttachmentFiles(workspaceId: string): Promise<void> {
    // Files are copied to dist/assets during build via nest-cli.json
    // The pattern **/dev-seeder/data/sample-files/** preserves the full path
    const IS_BUILT = __dirname.includes('/dist/');
    const sampleFilesDir = IS_BUILT
      ? join(
          __dirname,
          '../../../../../assets/engine/workspace-manager/dev-seeder/data/sample-files',
        )
      : join(__dirname, '../sample-files');

    const filesToCreate = [
      'sample-contract.pdf',
      'budget-2024.xlsx',
      'presentation.pptx',
      'screenshot.png',
      'archive.zip',
    ];

    for (const filename of filesToCreate) {
      const filePath = join(sampleFilesDir, filename);
      const fileBuffer = await readFile(filePath);

      await this.fileStorageService.write({
        file: fileBuffer,
        name: filename,
        folder: `workspace-${workspaceId}/attachment`,
        mimeType: this.getMimeType(filename),
      });
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      png: 'image/png',
      zip: 'application/zip',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}
