import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddChannelTargetRelatedRecordPathsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795449569000-add-channel-target-related-record-paths.command';
import { CHANNEL_TARGET_RELATED_RECORD_PATH_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-63/constants/channel-target-related-record-path-universal-identifiers.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const CHANNEL_TARGET_PATH_UNIVERSAL_IDENTIFIERS = Object.values(
  CHANNEL_TARGET_RELATED_RECORD_PATH_UNIVERSAL_IDENTIFIERS,
);

describe('2-63 workspace command - add channel target related record paths (integration)', () => {
  let command: AddChannelTargetRelatedRecordPathsCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  const findChannelTargetFlatRelatedRecordPaths = async () => {
    const { flatRelatedRecordPathMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatRelatedRecordPathMaps',
      ]);

    return CHANNEL_TARGET_PATH_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        flatRelatedRecordPathMaps.byUniversalIdentifier[universalIdentifier],
    ).filter(isDefined);
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<AddChannelTargetRelatedRecordPathsCommand>(
        'AddChannelTargetRelatedRecordPathsCommand',
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
              flatEntityToDelete:
                await findChannelTargetFlatRelatedRecordPaths(),
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

    expect(await findChannelTargetFlatRelatedRecordPaths()).toHaveLength(0);
  });

  it('adds the thread and event target paths once', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findChannelTargetFlatRelatedRecordPaths()).toHaveLength(
      CHANNEL_TARGET_PATH_UNIVERSAL_IDENTIFIERS.length,
    );
  });
});
