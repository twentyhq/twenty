import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DropAgentTurnEvaluationObjectCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791216273979-drop-agent-turn-evaluation-object.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const AGENT_TURN_EVALUATION_OBJECT_UNIVERSAL_IDENTIFIER =
  '73741409-7835-426f-8425-9de13af22302';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-46 workspace command - drop agent turn evaluation object (integration)', () => {
  let command: DropAgentTurnEvaluationObjectCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let objectMetadataId: string;

  const findEvaluationObject = async () => {
    const { flatObjectMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
      ]);

    return flatObjectMetadataMaps.byUniversalIdentifier[
      AGENT_TURN_EVALUATION_OBJECT_UNIVERSAL_IDENTIFIER
    ];
  };

  const countEvaluationTables = async () => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT count(*) FROM information_schema.tables
       WHERE table_schema = $1 AND table_name ILIKE '%legacyTurnEvaluation%'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return Number(count);
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<DropAgentTurnEvaluationObjectCommand>(
      'DropAgentTurnEvaluationObjectCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'legacyTurnEvaluation',
        namePlural: 'legacyTurnEvaluations',
        labelSingular: 'Legacy turn evaluation',
        labelPlural: 'Legacy turn evaluations',
        icon: 'IconLego',
      },
    });

    objectMetadataId = data.createOneObject.id;

    // Stands in for the object a workspace provisioned before 2.46
    await global.testDataSource.query(
      `UPDATE core."objectMetadata" SET "universalIdentifier" = $1 WHERE id = $2`,
      [AGENT_TURN_EVALUATION_OBJECT_UNIVERSAL_IDENTIFIER, objectMetadataId],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatObjectMetadataMaps'],
    );
  });

  it('deletes the object and its table', async () => {
    expect(await findEvaluationObject()).toBeDefined();
    expect(await countEvaluationTables()).toBe(1);

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findEvaluationObject()).toBeUndefined();
    expect(await countEvaluationTables()).toBe(0);
    expect(
      await global.testDataSource.query(
        `SELECT id FROM core."objectMetadata" WHERE id = $1`,
        [objectMetadataId],
      ),
    ).toEqual([]);
  });

  it('changes nothing when it runs again', async () => {
    await expect(
      command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS),
    ).resolves.toBeUndefined();
    expect(await findEvaluationObject()).toBeUndefined();
  });
});
