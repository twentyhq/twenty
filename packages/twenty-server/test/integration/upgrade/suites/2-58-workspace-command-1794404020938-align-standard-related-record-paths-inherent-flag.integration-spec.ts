import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { createRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path.util';
import { deleteRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/delete-related-record-path.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type AlignStandardRelatedRecordPathsInherentFlagCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794404020938-align-standard-related-record-paths-inherent-flag.command';
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

  const setTwoRelationStandardPathsRegular = async () => {
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
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<AlignStandardRelatedRecordPathsInherentFlagCommand>(
        'AlignStandardRelatedRecordPathsInherentFlagCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await setTwoRelationStandardPathsRegular();
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

  it('leaves regular a standard path that would form a cycle with an inherent path of the workspace', async () => {
    await setTwoRelationStandardPathsRegular();
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { flatObjectMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
      ]);
    const noteObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.note.universalIdentifier
      ];
    const companyObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.company.universalIdentifier
      ];

    jestExpectToBeDefined(noteObjectMetadata);
    jestExpectToBeDefined(companyObjectMetadata);

    const noteCompanyField = await createRelationBetweenObjects({
      objectMetadataId: noteObjectMetadata.id,
      targetObjectMetadataId: companyObjectMetadata.id,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'cycleCompany',
      label: 'Cycle company',
      targetFieldLabel: 'Cycle notes',
      targetFieldIcon: 'IconBox',
    });
    const pathResponse = await createRelatedRecordPath({
      objectMetadataId: noteObjectMetadata.id,
      firstFieldMetadataId: noteCompanyField.id,
      isInherent: true,
    });

    expect(pathResponse.body.errors).toBeUndefined();

    try {
      await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

      const regularObjectMetadataUniversalIdentifiers = (
        await findTwoRelationStandardFlatRelatedRecordPaths()
      )
        .filter(({ isInherent }) => !isInherent)
        .map(
          ({ objectMetadataUniversalIdentifier }) =>
            objectMetadataUniversalIdentifier,
        );

      expect([...new Set(regularObjectMetadataUniversalIdentifiers)]).toEqual([
        STANDARD_OBJECTS.company.universalIdentifier,
      ]);
    } finally {
      await deleteRelatedRecordPath(
        pathResponse.body.data.createRelatedRecordPath.id,
      );
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: noteCompanyField.id,
          updatePayload: { isActive: false },
        },
        gqlFields: 'id',
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: noteCompanyField.id },
      });
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });
});
