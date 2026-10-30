import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddStandardRelatedRecordPathsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793375369182-add-standard-related-record-paths.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_RELATED_RECORD_PATHS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-related-record-paths.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-55 workspace command - add standard related record paths (integration)', () => {
  let command: AddStandardRelatedRecordPathsCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  const findStandardFlatRelatedRecordPaths = async () => {
    const { flatRelatedRecordPathMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatRelatedRecordPathMaps',
      ]);

    return Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        ({ applicationUniversalIdentifier }) =>
          applicationUniversalIdentifier ===
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      );
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddStandardRelatedRecordPathsCommand>(
      'AddStandardRelatedRecordPathsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    workspaceMigrationValidateBuildAndRunService =
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      );

    const result =
      await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            relatedRecordPath: {
              flatEntityToCreate: [],
              flatEntityToDelete: await findStandardFlatRelatedRecordPaths(),
              flatEntityToUpdate: [],
            },
          },
        },
      );

    expect(result.status).toBe('success');
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('leaves the paths absent on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findStandardFlatRelatedRecordPaths()).toHaveLength(0);
  });

  it('adds every standard path once', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findStandardFlatRelatedRecordPaths()).toHaveLength(
      STANDARD_RELATED_RECORD_PATHS.length,
    );
  });
});
