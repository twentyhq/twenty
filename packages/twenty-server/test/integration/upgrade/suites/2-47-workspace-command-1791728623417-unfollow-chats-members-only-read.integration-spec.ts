import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UnfollowChatsMembersOnlyReadCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791728623417-unfollow-chats-members-only-read.command';
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

const { JANE, JONY, PHIL, TIM } = WORKSPACE_MEMBER_DATA_SEED_IDS;

describe('2-47 workspace command - unfollow chats members only read (integration)', () => {
  let command: UnfollowChatsMembersOnlyReadCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const threadId = randomUUID();
  const filedThreadId = randomUUID();

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readFollowing = async () => {
    const rows: {
      threadId: string;
      workspaceMemberId: string;
      isSubscribed: boolean;
    }[] = await global.testDataSource.query(
      `SELECT "threadId", "workspaceMemberId", "isSubscribed"
       FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = ANY($1)`,
      [[threadId, filedThreadId]],
    );

    return Object.fromEntries(
      rows.map((row) => [
        `${row.threadId === threadId ? 'chat' : 'filed'}:${row.workspaceMemberId}`,
        row.isSubscribed,
      ]),
    );
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<UnfollowChatsMembersOnlyReadCommand>(
      'UnfollowChatsMembersOnlyReadCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    // Jane owns the chat, Jony wrote in it and Tim is assigned; Phil only
    // read it, and filed the other chat
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId", "assigneeId", "writerWorkspaceMemberIds")
       VALUES ($1, 'Read by Phil', $3, $4, ARRAY[$5]::text[]), ($2, 'Filed by Phil', $3, NULL, NULL)`,
      [threadId, filedThreadId, JANE, TIM, JONY],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThreadParticipant" ("threadId", "workspaceMemberId", "lastReadAt", "archivedAt")
       VALUES ($1, $3, now(), NULL), ($1, $4, now(), NULL), ($1, $5, now(), NULL), ($1, $6, now(), NULL),
              ($2, $6, now(), now())`,
      [threadId, filedThreadId, JANE, JONY, TIM, PHIL],
    );
  });

  afterAll(async () => {
    // down follows every unfiled row that does not follow, in any chat
    await runCommand('up');
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = ANY($1)`,
      [[threadId, filedThreadId]],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1)`,
      [[threadId, filedThreadId]],
    );
  });

  it('unfollows only the chats a member read without taking part in or filing them', async () => {
    await runCommand('up');

    expect(await readFollowing()).toEqual({
      [`chat:${JANE}`]: true,
      [`chat:${JONY}`]: true,
      [`chat:${TIM}`]: true,
      [`chat:${PHIL}`]: false,
      [`filed:${PHIL}`]: true,
    });
  });

  it('changes nothing when run again', async () => {
    await runCommand('up');

    expect((await readFollowing())[`chat:${PHIL}`]).toBe(false);
  });

  it('follows the unfollowed chats again on rollback', async () => {
    await runCommand('down');

    expect(await readFollowing()).toEqual({
      [`chat:${JANE}`]: true,
      [`chat:${JONY}`]: true,
      [`chat:${TIM}`]: true,
      [`chat:${PHIL}`]: true,
      [`filed:${PHIL}`]: true,
    });
  });
});
