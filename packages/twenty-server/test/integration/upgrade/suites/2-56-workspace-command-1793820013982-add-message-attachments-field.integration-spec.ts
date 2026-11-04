import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddMessageAttachmentsFieldCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793820013982-add-message-attachments-field.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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
const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.fields.attachments.universalIdentifier;

describe('2-56 workspace command - add message attachments field (integration)', () => {
  let command: AddMessageAttachmentsFieldCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const findAttachmentsField = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
    // queryRunner.getTable chokes on the generated searchVector column of message
    const columns: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'message' AND column_name = 'attachments'`,
      [SCHEMA],
    );

    return {
      type: flatFieldMetadataMaps.byUniversalIdentifier[
        ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER
      ]?.type,
      hasColumn: columns.length > 0,
    };
  };

  const removeAttachmentsField = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
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
            flatEntityToDelete: [
              findFlatEntityByUniversalIdentifierOrThrow<FlatFieldMetadata>({
                flatEntityMaps: flatFieldMetadataMaps,
                universalIdentifier: ATTACHMENTS_FIELD_UNIVERSAL_IDENTIFIER,
              }),
            ],
            flatEntityToUpdate: [],
          },
        },
      });

    expect(result.status).toBe('success');
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddMessageAttachmentsFieldCommand>(
      'AddMessageAttachmentsFieldCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await removeAttachmentsField();
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('leaves the workspace unchanged on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findAttachmentsField()).toEqual({
      type: undefined,
      hasColumn: false,
    });
  });

  it('adds the files field and its column, and is a no-op when run again', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findAttachmentsField()).toEqual({
      type: FieldMetadataType.FILES,
      hasColumn: true,
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findAttachmentsField()).toEqual({
      type: FieldMetadataType.FILES,
      hasColumn: true,
    });
  });
});
