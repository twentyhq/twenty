import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793639083811-add-direct-message-pair-identity.command';
import { type EnableDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793639083813-enable-direct-message-pair-identity.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
const IDENTITY_FEATURE_FLAG =
  FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED;
const PAIR = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
  secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
};

describe('2-56 workspace command - add direct message pair identity (integration)', () => {
  let command: AddDirectMessagePairIdentityCommand;
  let enableCommand: EnableDirectMessagePairIdentityCommand;
  let featureFlagService: FeatureFlagService;
  let workspaceCacheService: WorkspaceCacheService;
  let identityService: AgentChatDirectMessageIdentityService;
  let originalFlagValue: boolean | undefined;

  const deleteThread = (threadId: string) =>
    global.testDataSource
      .createQueryBuilder()
      .delete()
      .from(`${SCHEMA}.agentChatThread`)
      .where('id = :threadId', { threadId })
      .execute();

  const findIdentityFlag = async (): Promise<boolean | undefined> => {
    const [flag]: { value: boolean }[] = await global.testDataSource.query(
      `SELECT value FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
      [SEED_APPLE_WORKSPACE_ID, IDENTITY_FEATURE_FLAG],
    );

    return flag?.value;
  };

  const setIdentityFlag = async (value: boolean | undefined) => {
    if (isDefined(value)) {
      await featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        featureFlag: IDENTITY_FEATURE_FLAG,
        value,
      });

      return;
    }

    await global.testDataSource.query(
      `DELETE FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
      [SEED_APPLE_WORKSPACE_ID, IDENTITY_FEATURE_FLAG],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['featureFlagsMap'],
    );
  };

  const findPairIdentity = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const queryRunner = global.testDataSource.createQueryRunner();

    try {
      const table = await queryRunner.getTable(`${SCHEMA}.agentChatThread`);

      if (!isDefined(table)) {
        throw new Error('Agent chat thread table is missing');
      }

      const columns = table.columns.filter(({ name }) =>
        PAIR_COLUMN_NAMES.includes(name),
      );
      const pairIndexes = table.indices.filter(({ columnNames }) =>
        PAIR_COLUMN_NAMES.every((columnName) =>
          columnNames.includes(columnName),
        ),
      );

      return {
        hasFields: PAIR_FIELD_UNIVERSAL_IDENTIFIERS.every(
          (universalIdentifier) =>
            isDefined(
              flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
            ),
        ),
        hasIndexMetadata: isDefined(
          flatIndexMaps.byUniversalIdentifier[PAIR_INDEX_UNIVERSAL_IDENTIFIER],
        ),
        columnCount: columns.length,
        pairIndexes: pairIndexes.map(
          ({ name, columnNames, isUnique, where }) => ({
            name,
            columnNames: [...columnNames].sort(),
            isUnique,
            where,
          }),
        ),
      };
    } finally {
      await queryRunner.release();
    }
  };

  const removePairIndexAndFields = async (
    fieldUniversalIdentifiers: string[],
  ) => {
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
            flatEntityToDelete: fieldUniversalIdentifiers.map(
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
    enableCommand =
      getAppProviderByClassName<EnableDirectMessagePairIdentityCommand>(
        'EnableDirectMessagePairIdentityCommand',
      );
    featureFlagService =
      getAppProviderByClassName<FeatureFlagService>('FeatureFlagService');
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    identityService =
      getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      );

    originalFlagValue = await findIdentityFlag();
    await setIdentityFlag(undefined);
    await removePairIndexAndFields(PAIR_FIELD_UNIVERSAL_IDENTIFIERS);
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await setIdentityFlag(originalFlagValue);
  });

  it('keeps identity allocation disabled when storage is absent', async () => {
    expect(await findPairIdentity()).toEqual({
      hasFields: false,
      hasIndexMetadata: false,
      columnCount: 0,
      pairIndexes: [],
    });
    await enableCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findIdentityFlag()).toBeUndefined();
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

  it('enables identity allocation only after storage is added and the flag upgrade runs', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findPairIdentity()).toEqual({
      hasFields: true,
      hasIndexMetadata: true,
      columnCount: PAIR_COLUMN_NAMES.length,
      pairIndexes: [
        {
          name: expect.any(String),
          columnNames: PAIR_COLUMN_NAMES,
          isUnique: true,
          where: '',
        },
      ],
    });

    expect(await findIdentityFlag()).toBeUndefined();
    await expect(identityService.getOrCreate(PAIR)).rejects.toMatchObject({
      code: AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
    });

    await enableCommand.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findIdentityFlag()).toBeUndefined();

    await enableCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findIdentityFlag()).toBe(true);

    const threadId = await identityService.getOrCreate(PAIR);

    try {
      await expect(identityService.getOrCreate(PAIR)).resolves.toBe(threadId);
    } finally {
      await deleteThread(threadId);
    }
  });

  it('keeps stored pairs when it restores a missing index', async () => {
    const threadId = await identityService.getOrCreate(PAIR);

    try {
      await setIdentityFlag(false);

      await expect(identityService.getOrCreate(PAIR)).rejects.toMatchObject({
        code: AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
      });

      await removePairIndexAndFields([]);
      await enableCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

      expect(await findIdentityFlag()).toBe(false);
      await expect(identityService.getOrCreate(PAIR)).rejects.toMatchObject({
        code: AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
      });

      await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
      await enableCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

      expect(await findIdentityFlag()).toBe(true);
      await expect(identityService.getOrCreate(PAIR)).resolves.toBe(threadId);
    } finally {
      await deleteThread(threadId);
    }
  });

  it('leaves a fully upgraded workspace unchanged when it runs again', async () => {
    const pairIdentity = await findPairIdentity();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await enableCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findIdentityFlag()).toBe(true);
    expect(await findPairIdentity()).toEqual(pairIdentity);
  });
});
