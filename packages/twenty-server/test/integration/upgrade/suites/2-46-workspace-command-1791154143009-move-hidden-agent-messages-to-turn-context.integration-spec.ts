import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MoveHiddenAgentMessagesToTurnContextCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791154143009-move-hidden-agent-messages-to-turn-context.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
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

const KICKOFF_CONTEXT = 'Company: Acme\n\nThe user locale is French.';

describe('2-46 workspace command - move hidden agent messages to turn context (integration)', () => {
  let command: MoveHiddenAgentMessagesToTurnContextCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const threadId = randomUUID();
  const turnId = randomUUID();

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readHiddenMessages = () =>
    global.testDataSource.query(
      `SELECT message."turnId", message.role, part."textContent"
       FROM ${SCHEMA}."agentMessage" message
       JOIN ${SCHEMA}."agentMessagePart" part ON part."messageId" = message.id
       WHERE message."threadId" = $1 AND message."isHidden" = true`,
      [threadId],
    );

  const readContextColumns = () =>
    global.testDataSource.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = 'agentTurn' AND column_name = 'context'`,
      [SCHEMA],
    );

  const readTurnContexts = () =>
    global.testDataSource.query(
      `SELECT id, context FROM ${SCHEMA}."agentTurn" WHERE "threadId" = $1`,
      [threadId],
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<MoveHiddenAgentMessagesToTurnContextCommand>(
        'MoveHiddenAgentMessagesToTurnContextCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId")
       VALUES ($1, 'Turn context move', $2)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentTurn" (id, "threadId", context) VALUES ($1, $2, $3)`,
      [turnId, threadId, KICKOFF_CONTEXT],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", "turnId", role, status, "isHidden")
       VALUES ($1, $2, $3, 'assistant', 'sent', false)`,
      [randomUUID(), threadId, turnId],
    );
  });

  afterAll(async () => {
    await runCommand('up');

    for (const table of ['agentMessage', 'agentTurn']) {
      await global.testDataSource.query(
        `DELETE FROM ${SCHEMA}."${table}" WHERE "threadId" = $1`,
        [threadId],
      );
    }
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
  });

  it('rolls a turn context back into a hidden user message of that turn', async () => {
    await runCommand('down');

    expect(await readContextColumns()).toEqual([]);
    expect(await readHiddenMessages()).toEqual([
      { turnId, role: 'user', textContent: KICKOFF_CONTEXT },
    ]);
  });

  it('moves the hidden message into its turn context and deletes it', async () => {
    await runCommand('up');

    expect(await readContextColumns()).toHaveLength(1);
    expect(await readTurnContexts()).toEqual([
      { id: turnId, context: KICKOFF_CONTEXT },
    ]);
    expect(await readHiddenMessages()).toEqual([]);
  });

  it('changes nothing when run again', async () => {
    await runCommand('up');

    expect(await readTurnContexts()).toEqual([
      { id: turnId, context: KICKOFF_CONTEXT },
    ]);
    expect(await readHiddenMessages()).toEqual([]);
  });
});
