import { type DataSource } from 'typeorm';

import { type LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '11111111-1111-4111-8111-111111111111';

const buildRunner = () => {
  const workspaceCacheService = {
    invalidateAndRecompute: jest.fn().mockResolvedValue(undefined),
  };
  const workspaceMetadataVersionService = {
    incrementMetadataVersion: jest.fn().mockResolvedValue(undefined),
  };
  const logger = {
    perfTime: jest.fn(),
    perfTimeEnd: jest.fn(),
  };

  const runner = new WorkspaceMigrationRunnerService(
    {} as WorkspaceManyOrAllFlatEntityMapsCacheService,
    {} as DataSource,
    {} as WorkspaceMigrationRunnerActionHandlerRegistryService,
    workspaceMetadataVersionService as unknown as WorkspaceMetadataVersionService,
    workspaceCacheService as unknown as WorkspaceCacheService,
    {} as MetricsService,
    logger as unknown as LoggerService,
    {} as TwentyConfigService,
  );

  return { runner, workspaceCacheService, workspaceMetadataVersionService };
};

describe('WorkspaceMigrationRunnerService.invalidateCache', () => {
  it('recomputes the GraphQL resolver name map and bumps the metadata version when object metadata changed', async () => {
    const { runner, workspaceCacheService, workspaceMetadataVersionService } =
      buildRunner();

    await runner.invalidateCache({
      allFlatEntityMapsKeys: ['flatObjectMetadataMaps'],
      workspaceId: WORKSPACE_ID,
    });

    expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.arrayContaining([
        'flatObjectMetadataMaps',
        'ORMEntityMetadatas',
        'graphQLResolverNameMap',
      ]),
    );
    expect(
      workspaceMetadataVersionService.incrementMetadataVersion,
    ).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it('still bumps the metadata version when the recompute fails', async () => {
    const { runner, workspaceCacheService, workspaceMetadataVersionService } =
      buildRunner();

    workspaceCacheService.invalidateAndRecompute.mockRejectedValue(
      new Error(
        'Cache provider with key name "graphQLResolverNameMap" not found',
      ),
    );

    await expect(
      runner.invalidateCache({
        allFlatEntityMapsKeys: ['flatFieldMetadataMaps'],
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow('graphQLResolverNameMap');

    expect(
      workspaceMetadataVersionService.incrementMetadataVersion,
    ).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it('does not bump the metadata version when no schema-bearing maps changed', async () => {
    const { runner, workspaceMetadataVersionService } = buildRunner();

    await runner.invalidateCache({
      allFlatEntityMapsKeys: ['flatViewMaps'],
      workspaceId: WORKSPACE_ID,
    });

    expect(
      workspaceMetadataVersionService.incrementMetadataVersion,
    ).not.toHaveBeenCalled();
  });
});
