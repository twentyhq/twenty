import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddMessageAttachmentTargetCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793876432369-add-message-attachment-target.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const MESSAGE_ATTACHMENT_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.attachment.fields.targetMessage.universalIdentifier,
  STANDARD_OBJECTS.message.fields.attachments.universalIdentifier,
];

const MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.attachment.indexes.messageIdIndex.universalIdentifier;

describe('2-57 workspace command - add message attachment target (integration)', () => {
  let command: AddMessageAttachmentTargetCommand;
  let featureFlagService: FeatureFlagService;
  let workspaceCacheService: WorkspaceCacheService;
  let originalFlagValue: boolean | undefined;

  const findMessageAttachmentFlag = async (): Promise<boolean | undefined> => {
    const [flag]: { value: boolean }[] = await global.testDataSource.query(
      `SELECT value FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
      [SEED_APPLE_WORKSPACE_ID, FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED],
    );

    return flag?.value;
  };

  const setMessageAttachmentFlag = async (value: boolean | undefined) => {
    if (isDefined(value)) {
      await featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        featureFlag: FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
        value,
      });

      return;
    }

    await global.testDataSource.query(
      `DELETE FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
      [SEED_APPLE_WORKSPACE_ID, FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['featureFlagsMap'],
    );
  };

  const getFlatFieldAndIndexMaps = () =>
    workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatIndexMaps',
    ]);

  const findMessageAttachmentTarget = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await getFlatFieldAndIndexMaps();
    const columns: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'attachment' AND column_name = 'targetMessageId'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return {
      fieldCount: MESSAGE_ATTACHMENT_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          isDefined(
            findFlatEntityByUniversalIdentifier({
              flatEntityMaps: flatFieldMetadataMaps,
              universalIdentifier,
            }),
          ),
      ).length,
      hasIndex: isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier: MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER,
        }),
      ),
      hasColumn: columns.length > 0,
    };
  };

  const removeMessageAttachmentTarget = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await getFlatFieldAndIndexMaps();
    const { twentyStandardFlatApplication } =
      await getAppProviderByClassName<ApplicationService>(
        'ApplicationService',
      ).findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });
    const result =
      await getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      ).validateBuildAndRunLegacyWorkspaceMigration({
        shouldDeferActions: false,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        isSystemBuild: true,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete:
              MESSAGE_ATTACHMENT_FIELD_UNIVERSAL_IDENTIFIERS.map(
                (universalIdentifier) =>
                  findFlatEntityByUniversalIdentifierOrThrow<FlatFieldMetadata>(
                    {
                      flatEntityMaps: flatFieldMetadataMaps,
                      universalIdentifier,
                    },
                  ),
              ),
            flatEntityToUpdate: [],
          },
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: [
              findFlatEntityByUniversalIdentifierOrThrow<FlatIndexMetadata>({
                flatEntityMaps: flatIndexMaps,
                universalIdentifier: MESSAGE_ID_INDEX_UNIVERSAL_IDENTIFIER,
              }),
            ],
            flatEntityToUpdate: [],
          },
        },
      });

    expect(result.status).toBe('success');
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddMessageAttachmentTargetCommand>(
      'AddMessageAttachmentTargetCommand',
    );
    featureFlagService =
      getAppProviderByClassName<FeatureFlagService>('FeatureFlagService');
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    originalFlagValue = await findMessageAttachmentFlag();
    await setMessageAttachmentFlag(undefined);
    await removeMessageAttachmentTarget();
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await setMessageAttachmentFlag(originalFlagValue);
  });

  it('leaves the workspace unchanged on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findMessageAttachmentTarget()).toEqual({
      fieldCount: 0,
      hasIndex: false,
      hasColumn: false,
    });
    expect(await findMessageAttachmentFlag()).toBeUndefined();
  });

  it('adds both relation fields, the index and the column, enables message attachments, and is a no-op when run again', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findMessageAttachmentTarget()).toEqual({
      fieldCount: 2,
      hasIndex: true,
      hasColumn: true,
    });
    expect(await findMessageAttachmentFlag()).toBe(true);

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findMessageAttachmentTarget()).toEqual({
      fieldCount: 2,
      hasIndex: true,
      hasColumn: true,
    });
  });

  it('enables message attachments when the target already exists', async () => {
    await setMessageAttachmentFlag(undefined);

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findMessageAttachmentFlag()).toBe(true);
  });
});
