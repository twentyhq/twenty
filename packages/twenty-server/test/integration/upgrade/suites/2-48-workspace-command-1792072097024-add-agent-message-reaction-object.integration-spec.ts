import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddAgentMessageReactionObjectCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792072097024-add-agent-message-reaction-object.command';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const FIELD_UNIVERSAL_IDENTIFIERS = [
  ...Object.values(STANDARD_OBJECTS.agentMessageReaction.fields).map(
    ({ universalIdentifier }) => universalIdentifier,
  ),
  STANDARD_OBJECTS.agentMessage.fields.reactions.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.agentMessageReactions
    .universalIdentifier,
];

const INDEX_UNIVERSAL_IDENTIFIERS = Object.values(
  STANDARD_OBJECTS.agentMessageReaction.indexes,
).map(({ universalIdentifier }) => universalIdentifier);

describe('2-48 workspace command - add agent message reaction object (integration)', () => {
  let command: AddAgentMessageReactionObjectCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const findReactionMetadata = async () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    return {
      hasObject:
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.agentMessageReaction.universalIdentifier,
        }) !== undefined,
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }) !== undefined,
      ).length,
      indexCount: INDEX_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatIndexMaps,
            universalIdentifier,
          }) !== undefined,
      ).length,
    };
  };

  const hasReactionTable = async (): Promise<boolean> => {
    const tables: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = 'agentMessageReaction'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return tables.length === 1;
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddAgentMessageReactionObjectCommand>(
      'AddAgentMessageReactionObjectCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  // Leaves the workspace as it found it, with the object provisioned
  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('changes nothing on a dry run', async () => {
    await command.down({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun: true } });

    expect(await findReactionMetadata()).toEqual({
      hasObject: true,
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.length,
      indexCount: INDEX_UNIVERSAL_IDENTIFIERS.length,
    });
  });

  it('removes the object, its inverse relations and indexes on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findReactionMetadata()).toEqual({
      hasObject: false,
      fieldCount: 0,
      indexCount: 0,
    });
    expect(await hasReactionTable()).toBe(false);
  });

  it('only reports what it would create on a dry run', async () => {
    await command.up({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun: true } });

    expect(await findReactionMetadata()).toEqual({
      hasObject: false,
      fieldCount: 0,
      indexCount: 0,
    });
  });

  it('creates them back on up', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findReactionMetadata()).toEqual({
      hasObject: true,
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.length,
      indexCount: INDEX_UNIVERSAL_IDENTIFIERS.length,
    });
    expect(await hasReactionTable()).toBe(true);
  });

  it('changes nothing when it runs again', async () => {
    await expect(command.up(RUN_ON_WORKSPACE_ARGS)).resolves.toBeUndefined();
    expect(await findReactionMetadata()).toEqual({
      hasObject: true,
      fieldCount: FIELD_UNIVERSAL_IDENTIFIERS.length,
      indexCount: INDEX_UNIVERSAL_IDENTIFIERS.length,
    });
  });
});
