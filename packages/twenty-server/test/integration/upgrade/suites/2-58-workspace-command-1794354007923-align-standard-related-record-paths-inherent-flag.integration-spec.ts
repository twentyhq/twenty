import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AlignStandardRelatedRecordPathsInherentFlagCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794354007923-align-standard-related-record-paths-inherent-flag.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-58 workspace command - align standard related record paths inherent flag (integration)', () => {
  let command: AlignStandardRelatedRecordPathsInherentFlagCommand;
  let workspaceCacheService: WorkspaceCacheService;

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

  const findTwoRelationStandardFlatRelatedRecordPaths = async () =>
    (await findStandardFlatRelatedRecordPaths()).filter(
      ({ secondFieldMetadataUniversalIdentifier }) =>
        isDefined(secondFieldMetadataUniversalIdentifier),
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<AlignStandardRelatedRecordPathsInherentFlagCommand>(
        'AlignStandardRelatedRecordPathsInherentFlagCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const result =
      await getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      ).validateBuildAndRunLegacyWorkspaceMigration({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName: {
          relatedRecordPath: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: (
              await findTwoRelationStandardFlatRelatedRecordPaths()
            ).map((flatRelatedRecordPath) => ({
              ...flatRelatedRecordPath,
              isInherent: false,
            })),
          },
        },
      });

    expect(result.status).toBe('success');
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('leaves the note and task paths regular on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    const flatRelatedRecordPaths =
      await findTwoRelationStandardFlatRelatedRecordPaths();

    expect(flatRelatedRecordPaths.length).toBeGreaterThan(0);
    expect(flatRelatedRecordPaths.every(({ isInherent }) => !isInherent)).toBe(
      true,
    );
  });

  it('makes every standard path inherent, and stays idempotent', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(
      (await findStandardFlatRelatedRecordPaths()).every(
        ({ isInherent }) => isInherent,
      ),
    ).toBe(true);
  });
});
