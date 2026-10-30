import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793366004507-add-direct-message-pair-identity.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};
const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const PAIR_COLUMN_NAMES = [
  'directMessageFirstWorkspaceMemberId',
  'directMessageSecondWorkspaceMemberId',
];
const PAIR_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.directMessageFirstWorkspaceMemberId
    .universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.directMessageSecondWorkspaceMemberId
    .universalIdentifier,
];
const PAIR_INDEX_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.indexes.directMessagePairUniqueIndex
    .universalIdentifier;
const PAIR = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
  secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
};

describe('2-54 workspace command - add direct message pair identity (integration)', () => {
  let command: AddDirectMessagePairIdentityCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let identityService: AgentChatDirectMessageIdentityService;

  const findPairIdentity = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const columns: { column_name: string }[] =
      await global.testDataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'agentChatThread'
           AND column_name = ANY($2::text[])`,
        [SCHEMA, PAIR_COLUMN_NAMES],
      );
    const pairIndexes: { indexdef: string }[] =
      await global.testDataSource.query(
        `SELECT indexdef FROM pg_indexes
         WHERE schemaname = $1 AND tablename = 'agentChatThread'
           AND indexdef LIKE 'CREATE UNIQUE INDEX%directMessageFirstWorkspaceMemberId%'`,
        [SCHEMA],
      );

    return {
      hasFields: PAIR_FIELD_UNIVERSAL_IDENTIFIERS.every((universalIdentifier) =>
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        ),
      ),
      hasIndexMetadata: isDefined(
        flatIndexMaps.byUniversalIdentifier[PAIR_INDEX_UNIVERSAL_IDENTIFIER],
      ),
      columnCount: columns.length,
      pairIndexes: pairIndexes.map(({ indexdef }) => indexdef),
    };
  };

  const removePairIdentity = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
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
            flatEntityToDelete: PAIR_FIELD_UNIVERSAL_IDENTIFIERS.map(
              (universalIdentifier) =>
                findFlatEntityByUniversalIdentifierOrThrow<FlatFieldMetadata>({
                  flatEntityMaps: flatFieldMetadataMaps,
                  universalIdentifier,
                }),
            ),
            flatEntityToUpdate: [],
          },
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: [
              findFlatEntityByUniversalIdentifierOrThrow<FlatIndexMetadata>({
                flatEntityMaps: flatIndexMaps,
                universalIdentifier: PAIR_INDEX_UNIVERSAL_IDENTIFIER,
              }),
            ],
            flatEntityToUpdate: [],
          },
        },
      });

    expect(result.status).toBe('success');
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddDirectMessagePairIdentityCommand>(
      'AddDirectMessagePairIdentityCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    identityService =
      getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      );

    await removePairIdentity();
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('fences identity allocation until the command reaches the workspace', async () => {
    expect(await findPairIdentity()).toEqual({
      hasFields: false,
      hasIndexMetadata: false,
      columnCount: 0,
      pairIndexes: [],
    });
    await expect(identityService.getOrCreate(PAIR)).rejects.toMatchObject({
      code: AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
    });
  });

  it('leaves the workspace unchanged on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findPairIdentity()).toEqual({
      hasFields: false,
      hasIndexMetadata: false,
      columnCount: 0,
      pairIndexes: [],
    });
  });

  it('adds the pair columns and a partial unique index, then lifts the fence', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findPairIdentity()).toEqual({
      hasFields: true,
      hasIndexMetadata: true,
      columnCount: PAIR_COLUMN_NAMES.length,
      pairIndexes: [
        expect.stringContaining(
          'WHERE ("directMessageFirstWorkspaceMemberId" IS NOT NULL)',
        ),
      ],
    });

    const threadId = await identityService.getOrCreate(PAIR);

    try {
      await expect(identityService.getOrCreate(PAIR)).resolves.toBe(threadId);
    } finally {
      await global.testDataSource.query(
        `DELETE FROM "${SCHEMA}"."agentChatThread" WHERE id = $1`,
        [threadId],
      );
    }
  });

  it('leaves a fully upgraded workspace unchanged when it runs again', async () => {
    const pairIdentity = await findPairIdentity();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findPairIdentity()).toEqual(pairIdentity);
  });
});
