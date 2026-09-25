import { Logger } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, type TestingModule } from '@nestjs/testing';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MetadataSideEffectEngineService } from 'src/engine/metadata-modules/metadata-side-effect/services/metadata-side-effect-engine.service';
import { MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { MetadataEventsToDbListener } from 'src/engine/subscriptions/metadata-event/metadata-events-to-db.listener';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationFlatEntityMapsService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-flat-entity-maps.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const METADATA_EVENTS = ['objectMetadata', 'fieldMetadata'].map(
  (metadataName) => ({
    metadataName,
    type: 'updated',
    recordId: `${metadataName}-id`,
    properties: { before: {}, after: {}, diff: {}, updatedFields: [] },
  }),
) as MetadataEvent[];
const WORKSPACE_MIGRATION: WorkspaceMigration = {
  applicationUniversalIdentifier: APPLICATION_ID,
  actions: [
    {
      type: 'update',
      metadataName: 'objectMetadata',
      universalIdentifier: 'object-id',
      update: { labelSingular: 'Conversation' },
    },
    {
      type: 'update',
      metadataName: 'fieldMetadata',
      universalIdentifier: 'field-id',
      update: { label: 'Title' },
    },
  ],
};

describe('Metadata event completion before command shutdown', () => {
  let module: TestingModule;
  let resourcesClosed: boolean;
  const enqueueWebhook = jest.fn();
  const publish = jest.fn();
  const getCacheHashes = jest.fn();
  const run = jest.fn();

  beforeEach(async () => {
    jest.useRealTimers();
    jest.resetAllMocks();
    resourcesClosed = false;
    getCacheHashes.mockResolvedValue({
      flatObjectMetadataMaps: 'object-hash',
      flatFieldMetadataMaps: 'field-hash',
    });
    run.mockResolvedValue({
      hasSchemaMetadataChanged: true,
      metadataEvents: METADATA_EVENTS,
    });

    module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot({ wildcard: true })],
      providers: [
        MetadataEventEmitter,
        MetadataEventsToDbListener,
        WorkspaceMigrationValidateBuildAndRunService,
        {
          provide: getQueueToken(MessageQueue.webhookQueue),
          useValue: { add: enqueueWebhook },
        },
        { provide: MetadataEventPublisher, useValue: { publish } },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getCacheHashes,
            onModuleDestroy: () => {
              resourcesClosed = true;
            },
          },
        },
        { provide: WorkspaceMigrationRunnerService, useValue: { run } },
        {
          provide: WorkspaceMigrationBuildOrchestratorService,
          useValue: {
            buildWorkspaceMigration: jest.fn().mockResolvedValue({
              status: 'success',
              workspaceMigration: WORKSPACE_MIGRATION,
            }),
          },
        },
        { provide: WorkspaceMigrationFlatEntityMapsService, useValue: {} },
        { provide: MetadataSideEffectEngineService, useValue: {} },
        {
          provide: MetricsService,
          useValue: { recordHistogram: jest.fn() },
        },
        { provide: LoggerService, useValue: { perf: jest.fn() } },
        { provide: TwentyConfigService, useValue: { get: () => [] } },
      ],
    }).compile();
    await module.init();
  });

  afterEach(async () => {
    if (!resourcesClosed) {
      await module.close();
    }
    jest.restoreAllMocks();
  });

  const migrate = (dryRun = false) =>
    module
      .get(WorkspaceMigrationValidateBuildAndRunService)
      .validateBuildAndRunWorkspaceMigrationFromTo({
        workspaceId: WORKSPACE_ID,
        buildOptions: {
          isSystemBuild: true,
          applicationUniversalIdentifier: APPLICATION_ID,
        },
        fromToAllFlatEntityMaps: {},
        additionalCacheDataMaps: {
          featureFlagsMap: {} as Record<FeatureFlagKey, boolean>,
        },
        dryRun,
      });

  it.each(['enqueue', 'publish'])(
    'keeps resources open until delayed %s work finishes for every batch',
    async (stage) => {
      let release!: () => void;
      const blocked = new Promise<void>((resolve) => {
        release = resolve;
      });
      const delayedWork = stage === 'enqueue' ? enqueueWebhook : publish;
      delayedWork.mockImplementation(() => blocked);

      const command = migrate().then(() => module.close());
      // Let the listener reach its suspended I/O and the command try to exit.
      await new Promise<void>((resolve) => setImmediate(resolve));

      try {
        expect(delayedWork).toHaveBeenCalled();
        expect(resourcesClosed).toBe(false);
      } finally {
        release();
        await command;
      }

      expect(enqueueWebhook).toHaveBeenCalledTimes(2);
      expect(publish).toHaveBeenCalledTimes(2);
      expect(
        publish.mock.calls.map(([batch]: [MetadataEventBatch]) => [
          batch.name,
          batch.updatedCollectionHash,
        ]),
      ).toEqual([
        ['metadata.objectMetadata.updated', 'object-hash'],
        ['metadata.fieldMetadata.updated', 'field-hash'],
      ]);
      expect(resourcesClosed).toBe(true);
    },
  );

  it('preserves listener error handling after the migration has committed', async () => {
    const error = new Error('Notification delivery failed');
    const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    publish.mockRejectedValueOnce(error);

    await expect(migrate()).resolves.toMatchObject({ status: 'success' });

    expect(logError).toHaveBeenCalledWith(error.message, error.stack);
    expect(publish).toHaveBeenCalledTimes(2);
  });

  it('does not run or publish events during a dry run', async () => {
    await expect(migrate(true)).resolves.toMatchObject({ status: 'success' });
    expect(run).not.toHaveBeenCalled();
    expect(enqueueWebhook).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });
});
