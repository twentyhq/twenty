import { type DataSource } from 'typeorm';

import { type LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

describe('WorkspaceMigrationRunnerService.invalidateCache', () => {
  const setup = ({
    prepareRecomputeContextError,
  }: { prepareRecomputeContextError?: Error } = {}) => {
    const callOrder: string[] = [];

    const flush = jest.fn(async () => {
      callOrder.push('flush');
    });
    const prepareRecomputeContext = jest.fn(async () => {
      callOrder.push('prepareRecomputeContext');

      if (prepareRecomputeContextError) {
        throw prepareRecomputeContextError;
      }

      return {};
    });
    const invalidateAndRecompute = jest.fn(async () => {
      callOrder.push('invalidateAndRecompute');
    });
    const invalidateFlatEntityMaps = jest.fn(async () => {
      callOrder.push('invalidateFlatEntityMaps');
    });
    const incrementMetadataVersion = jest.fn(async () => {
      callOrder.push('incrementMetadataVersion');
    });

    const runnerService = new WorkspaceMigrationRunnerService(
      {
        invalidateFlatEntityMaps,
      } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
      {} as unknown as DataSource,
      {} as unknown as WorkspaceMigrationRunnerActionHandlerRegistryService,
      {
        incrementMetadataVersion,
      } as unknown as WorkspaceMetadataVersionService,
      {
        flush,
        prepareRecomputeContext,
        invalidateAndRecompute,
      } as unknown as WorkspaceCacheService,
      {} as unknown as MetricsService,
      {
        perfTime: jest.fn(),
        perfTimeEnd: jest.fn(),
        error: jest.fn(),
      } as unknown as LoggerService,
      {} as unknown as TwentyConfigService,
    );

    return {
      runnerService,
      callOrder,
      flush,
      prepareRecomputeContext,
      invalidateAndRecompute,
      invalidateFlatEntityMaps,
      incrementMetadataVersion,
    };
  };

  it('flushes the union of main and legacy keys before resolving the fetch plan', async () => {
    const { runnerService, callOrder, flush, prepareRecomputeContext } =
      setup();

    await runnerService.invalidateCache({
      allFlatEntityMapsKeys: ['flatObjectMetadataMaps'],
      workspaceId: WORKSPACE_ID,
    });

    const expectedCacheKeyNames = [
      'flatObjectMetadataMaps',
      'ORMEntityMetadatas',
      'graphQLResolverNameMap',
    ];

    expect(flush).toHaveBeenCalledWith(WORKSPACE_ID, expectedCacheKeyNames);
    expect(prepareRecomputeContext).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expectedCacheKeyNames,
    );
    expect(callOrder.indexOf('flush')).toBeLessThan(
      callOrder.indexOf('prepareRecomputeContext'),
    );
  });

  it('leaves every key flushed when resolving the fetch plan fails', async () => {
    const {
      runnerService,
      flush,
      invalidateFlatEntityMaps,
      incrementMetadataVersion,
      invalidateAndRecompute,
    } = setup({
      prepareRecomputeContextError: new Error('connection terminated'),
    });

    await expect(
      runnerService.invalidateCache({
        allFlatEntityMapsKeys: ['flatObjectMetadataMaps'],
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow('connection terminated');

    // the flush already happened, so no key keeps pre-migration data under a
    // valid hash: the next getOrRecompute rebuilds from scratch
    expect(flush).toHaveBeenCalledTimes(1);
    expect(invalidateFlatEntityMaps).not.toHaveBeenCalled();
    expect(incrementMetadataVersion).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });
});
