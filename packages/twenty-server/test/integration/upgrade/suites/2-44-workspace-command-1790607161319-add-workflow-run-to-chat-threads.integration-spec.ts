import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type AddWorkflowRunToChatThreadsCommand,
  LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607161319-add-workflow-run-to-chat-threads.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.workflowStepId.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.fields.agentChatThreads.universalIdentifier,
];

const INDEX_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.indexes.workflowRunIndex.universalIdentifier;

describe('2-44 workspace command 1790607161319 - AddWorkflowRunToChatThreadsCommand (integration)', () => {
  let command: AddWorkflowRunToChatThreadsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readState = async () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    return {
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.filter((universalIdentifier) =>
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        ),
      ).length,
      hasIndex: isDefined(
        flatIndexMaps.byUniversalIdentifier[INDEX_UNIVERSAL_IDENTIFIER],
      ),
      isOwnerRequired:
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER
        ]?.isNullable === false,
      readability: threadObject?.readability,
      readabilityParentFieldUniversalIdentifiers:
        threadObject?.readabilityParentFieldUniversalIdentifiers,
    };
  };

  // What a workspace that has not run the command yet looks like: no run link
  // and threads PRIVATE, as 2.43 left them.
  const setPreUpgradeState = async () => {
    const migrationService =
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      );
    const applicationService =
      getAppProviderByClassName<ApplicationService>('ApplicationService');
    const { twentyStandardFlatApplication } =
      await applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: SEED_APPLE_WORKSPACE_ID },
      );
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ]!;
    const run = async (
      allFlatEntityOperationByMetadataName: Parameters<
        WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
      >[0]['allFlatEntityOperationByMetadataName'],
    ) => {
      const result =
        await migrationService.validateBuildAndRunLegacyWorkspaceMigration({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName,
        });

      expect(result.status).toBe('success');
    };

    await run({
      objectMetadata: {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: [
          {
            ...threadObject,
            readability: MetadataReadability.PRIVATE,
            readabilityParentFieldUniversalIdentifiers: null,
          },
        ],
      },
    });
    await run({
      fieldMetadata: {
        flatEntityToCreate: [],
        flatEntityToDelete: FIELD_UNIVERSAL_IDENTIFIERS.map(
          (universalIdentifier) =>
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        ).filter(isDefined) as FlatFieldMetadata[],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate: [],
        flatEntityToDelete: [
          flatIndexMaps.byUniversalIdentifier[INDEX_UNIVERSAL_IDENTIFIER],
        ].filter(isDefined) as FlatIndexMetadata[],
        flatEntityToUpdate: [],
      },
    });
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddWorkflowRunToChatThreadsCommand>(
      'AddWorkflowRunToChatThreadsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await setPreUpgradeState();
  });

  afterAll(async () => {
    await runCommand();
  });

  it('starts from a workspace without the run link', async () => {
    expect(await readState()).toMatchObject({
      fieldCount: 0,
      hasIndex: false,
      readability: MetadataReadability.PRIVATE,
    });
  });

  it('changes nothing on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await readState()).toMatchObject({
      fieldCount: 0,
      hasIndex: false,
      readability: MetadataReadability.PRIVATE,
    });
  });

  it('links threads to runs and makes them inherit their run readability, as a fresh install does', async () => {
    await runCommand();

    expect(await readState()).toEqual({
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.length,
      hasIndex: true,
      isOwnerRequired: false,
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [
        STANDARD_OBJECTS.agentChatThread.fields.workflowRun.universalIdentifier,
      ],
    });
  });

  it('is a no-op when run again', async () => {
    const before = await readState();

    await runCommand();

    expect(await readState()).toEqual(before);
  });

  it('leaves threads still under SYSTEM protection as they are', async () => {
    const { flatObjectMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ]!;
    const migrationService =
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      );
    const applicationService =
      getAppProviderByClassName<ApplicationService>('ApplicationService');
    const { twentyStandardFlatApplication } =
      await applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: SEED_APPLE_WORKSPACE_ID },
      );
    const setThreadProtection = async (
      protection: Pick<
        typeof threadObject,
        'readability' | 'readabilityParentFieldUniversalIdentifiers'
      >,
    ) => {
      const result =
        await migrationService.validateBuildAndRunLegacyWorkspaceMigration({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [{ ...threadObject, ...protection }],
            },
          },
        });

      expect(result.status).toBe('success');
    };

    await setThreadProtection({
      readability: MetadataReadability.SYSTEM,
      readabilityParentFieldUniversalIdentifiers: null,
    });
    await runCommand();

    expect(await readState()).toMatchObject({
      readability: MetadataReadability.SYSTEM,
    });

    await setThreadProtection({
      readability: threadObject.readability,
      readabilityParentFieldUniversalIdentifiers:
        threadObject.readabilityParentFieldUniversalIdentifiers,
    });
  });

  it('makes threads PRIVATE again on down', async () => {
    await workspaceOrmManager.executeInWorkspaceContext(
      () => command.down(RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

    expect(await readState()).toMatchObject({
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.length,
      readability: MetadataReadability.PRIVATE,
      readabilityParentFieldUniversalIdentifiers: null,
    });
  });
});
