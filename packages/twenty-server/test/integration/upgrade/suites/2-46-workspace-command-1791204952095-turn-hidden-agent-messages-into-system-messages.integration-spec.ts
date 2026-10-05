import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type TurnHiddenAgentMessagesIntoSystemMessagesCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791204952095-turn-hidden-agent-messages-into-system-messages.command';
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

describe('2-46 workspace command - turn hidden agent messages into system messages (integration)', () => {
  let command: TurnHiddenAgentMessagesIntoSystemMessagesCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const threadId = randomUUID();
  const turnId = randomUUID();
  const contextMessageId = randomUUID();
  const assistantMessageId = randomUUID();

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readMessages = () =>
    global.testDataSource.query(
      `SELECT id, role, "isHidden" FROM ${SCHEMA}."agentMessage"
       WHERE "threadId" = $1 ORDER BY "createdAt", id`,
      [threadId],
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<TurnHiddenAgentMessagesIntoSystemMessagesCommand>(
        'TurnHiddenAgentMessagesIntoSystemMessagesCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId")
       VALUES ($1, 'Hidden message move', $2)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentTurn" (id, "threadId") VALUES ($1, $2)`,
      [turnId, threadId],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", "turnId", role, status, "isHidden", "createdAt")
       VALUES ($1, $3, $4, 'user', 'sent', true, now() - interval '1 minute'),
              ($2, $3, $4, 'assistant', 'sent', false, now())`,
      [contextMessageId, assistantMessageId, threadId, turnId],
    );
  });

  afterAll(async () => {
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

  it('turns the hidden message into a system message', async () => {
    await runCommand('up');

    expect(await readMessages()).toEqual([
      { id: contextMessageId, role: 'system', isHidden: false },
      { id: assistantMessageId, role: 'assistant', isHidden: false },
    ]);
  });

  it('changes nothing when run again', async () => {
    await runCommand('up');

    expect(await readMessages()).toEqual([
      { id: contextMessageId, role: 'system', isHidden: false },
      { id: assistantMessageId, role: 'assistant', isHidden: false },
    ]);
  });

  it('rolls the system message back into a hidden user message', async () => {
    await runCommand('down');

    expect(await readMessages()).toEqual([
      { id: contextMessageId, role: 'user', isHidden: true },
      { id: assistantMessageId, role: 'assistant', isHidden: false },
    ]);
  });
});
