import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ScheduleAgentChatThreadSnoozeEndsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791093059050-schedule-agent-chat-thread-snooze-ends.command';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('2-46 workspace command - schedule agent chat thread snooze ends (integration)', () => {
  const pendingThreadId = randomUUID();
  const endedThreadId = randomUUID();
  let pendingSnoozedUntil: Date;

  beforeAll(async () => {
    for (const threadId of [pendingThreadId, endedThreadId]) {
      await global.testDataSource.query(
        `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId")
         VALUES ($1, 'Snooze ends', $2)`,
        [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      );
    }

    pendingSnoozedUntil = new Date(Date.now() + 30_000);

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThreadParticipant" ("threadId", "workspaceMemberId", "archivedAt", "snoozedUntil")
       VALUES ($1, $3, now(), $4), ($2, $3, now(), now() - interval '1 minute')`,
      [
        pendingThreadId,
        endedThreadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        pendingSnoozedUntil,
      ],
    );
  });

  afterAll(async () => {
    for (const threadId of [pendingThreadId, endedThreadId]) {
      await global.testDataSource.query(
        `DELETE FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1`,
        [threadId],
      );
      await global.testDataSource.query(
        `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
        [threadId],
      );
    }
  });

  it('queues the end of each snooze still pending', async () => {
    const command =
      getAppProviderByClassName<ScheduleAgentChatThreadSnoozeEndsCommand>(
        'ScheduleAgentChatThreadSnoozeEndsCommand',
      );
    const addSpy = jest
      .spyOn(command['delayedJobsQueueService'], 'add')
      .mockResolvedValue(undefined);

    await getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    ).executeInWorkspaceContext(
      () =>
        command.up({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          options: {},
          index: 0,
          total: 1,
        }),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

    const queuedThreadIds = addSpy.mock.calls.map(
      ([, data]) => (data as { threadId: string }).threadId,
    );
    const pendingCall = addSpy.mock.calls.find(
      ([, data]) => (data as { threadId: string }).threadId === pendingThreadId,
    );

    expect(queuedThreadIds).not.toContain(endedThreadId);
    expect(pendingCall?.[0]).toBe(END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME);
    expect(pendingCall?.[1]).toEqual({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId: pendingThreadId,
      snoozedUntil: pendingSnoozedUntil.toISOString(),
    });
    expect(pendingCall?.[2]?.delay).toBeGreaterThan(0);
    expect(pendingCall?.[2]?.delay).toBeLessThanOrEqual(30_000);

    addSpy.mockRestore();
  });
});
