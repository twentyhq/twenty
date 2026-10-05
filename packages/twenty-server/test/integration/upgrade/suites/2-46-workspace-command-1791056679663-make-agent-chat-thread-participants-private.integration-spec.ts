import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { type MakeAgentChatThreadParticipantsPrivateCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791056679663-make-agent-chat-thread-participants-private.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('2-46 workspace command - make agent chat thread participants private (integration)', () => {
  let command: MakeAgentChatThreadParticipantsPrivateCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const threadId = randomUUID();
  const janeParticipantId = randomUUID();
  const jonyParticipantId = randomUUID();

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const findParticipantObject = async () => {
    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);

    return flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
    ]!;
  };

  const readOwnerShares = async () => {
    const rows: { recordId: string; principalId: string }[] =
      await global.testDataSource.query(
        `SELECT "recordId", "principalId" FROM ${SCHEMA}."recordShare"
         WHERE "recordId" = ANY($1) AND "rowCause" = 'OWNER'
         ORDER BY "principalId"`,
        [[janeParticipantId, jonyParticipantId]],
      );

    return rows;
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MakeAgentChatThreadParticipantsPrivateCommand>(
        'MakeAgentChatThreadParticipantsPrivateCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    await runCommand('down');

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId")
       VALUES ($1, 'Private participants', $2)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThreadParticipant" (id, "threadId", "workspaceMemberId")
       VALUES ($1, $3, $4), ($2, $3, $5)`,
      [
        janeParticipantId,
        jonyParticipantId,
        threadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      ],
    );
  });

  afterAll(async () => {
    await runCommand('up');
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."recordShare" WHERE "recordId" = ANY($1)`,
      [[janeParticipantId, jonyParticipantId]],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1`,
      [threadId],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
  });

  it('starts from rows nobody is granted on a SYSTEM object', async () => {
    expect((await findParticipantObject()).readability).toBe(
      MetadataReadability.SYSTEM,
    );
    expect(await readOwnerShares()).toEqual([]);
  });

  it('grants each row to its member and makes the object PRIVATE', async () => {
    await runCommand('up');
    await runCommand('up');

    expect((await findParticipantObject()).readability).toBe(
      MetadataReadability.PRIVATE,
    );
    expect(await readOwnerShares()).toEqual(
      [
        {
          recordId: janeParticipantId,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
        {
          recordId: jonyParticipantId,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
      ].sort((first, second) =>
        first.principalId.localeCompare(second.principalId),
      ),
    );
  });

  it('makes the object SYSTEM again and removes the grants on down', async () => {
    await runCommand('down');

    expect((await findParticipantObject()).readability).toBe(
      MetadataReadability.SYSTEM,
    );
    expect(await readOwnerShares()).toEqual([]);
  });
});
