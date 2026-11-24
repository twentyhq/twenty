import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddCallRecordingRelatedRecordPathCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795517101008-add-call-recording-related-record-path.command';
import { CALL_RECORDING_RELATED_RECORD_PATH_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-63/constants/call-recording-related-record-path-universal-identifier.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-63 workspace command - add call recording related record path (integration)', () => {
  let command: AddCallRecordingRelatedRecordPathCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  const findCallRecordingFlatRelatedRecordPaths = async () => {
    const { flatRelatedRecordPathMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatRelatedRecordPathMaps',
      ]);

    return [
      flatRelatedRecordPathMaps.byUniversalIdentifier[
        CALL_RECORDING_RELATED_RECORD_PATH_UNIVERSAL_IDENTIFIER
      ],
    ].filter(isDefined);
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<AddCallRecordingRelatedRecordPathCommand>(
        'AddCallRecordingRelatedRecordPathCommand',
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
                await findCallRecordingFlatRelatedRecordPaths(),
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

  it('leaves the path absent on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findCallRecordingFlatRelatedRecordPaths()).toHaveLength(0);
  });

  it('adds the call recording path once', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findCallRecordingFlatRelatedRecordPaths()).toHaveLength(1);
  });
});
