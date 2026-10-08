import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type AddAgentChatThreadParticipantDoneAtCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791416060804-add-agent-chat-thread-participant-done-at.command';
import { type AddAgentChatThreadSubscriptionsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791322315043-add-agent-chat-thread-subscriptions.command';
import { type AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
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

const DONE_AT = new Date('2026-01-05T00:00:00.000Z');

describe('2-46 workspace command - add agent chat thread participant doneAt (integration)', () => {
  let command: AddAgentChatThreadParticipantDoneAtCommand;
  const threadId = randomUUID();

  const hasDoneAtField = async () => {
    const { flatFieldMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);

    return (
      findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.agentChatThreadParticipant.fields.doneAt
            .universalIdentifier,
      }) !== undefined
    );
  };

  const hasInboxState = () =>
    getAppProviderByClassName<AgentChatSharingService>(
      'AgentChatSharingService',
    ).hasInboxState(SEED_APPLE_WORKSPACE_ID);

  const readParticipants = async (columns: string) => {
    const rows: Record<string, unknown>[] = await global.testDataSource.query(
      `SELECT "workspaceMemberId", ${columns}
       FROM ${SCHEMA}."agentChatThreadParticipant"
       WHERE "threadId" = $1`,
      [threadId],
    );

    return rows.sort((a, b) =>
      String(a.workspaceMemberId).localeCompare(String(b.workspaceMemberId)),
    );
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<AddAgentChatThreadParticipantDoneAtCommand>(
        'AddAgentChatThreadParticipantDoneAtCommand',
      );

    // The other inbox fields the runtime fence waits for
    await getAppProviderByClassName<AddAgentChatThreadSubscriptionsCommand>(
      'AddAgentChatThreadSubscriptionsCommand',
    ).up(RUN_ON_WORKSPACE_ARGS);
    await command.up(RUN_ON_WORKSPACE_ARGS);

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, title, "workspaceMemberId")
       VALUES ($1, 'Done state split', $2)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThreadParticipant" ("threadId", "workspaceMemberId", "doneAt")
       VALUES ($1, $2, $3), ($1, $4, NULL)`,
      [
        threadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        DONE_AT,
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      ],
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1`,
      [threadId],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
  });

  it('moves doneAt back to archivedAt and closes the inbox on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await hasDoneAtField()).toBe(false);
    expect(await hasInboxState()).toBe(false);
    expect(await readParticipants('"archivedAt"')).toEqual(
      [
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          archivedAt: DONE_AT,
        },
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
          archivedAt: null,
        },
      ].sort((a, b) => a.workspaceMemberId.localeCompare(b.workspaceMemberId)),
    );
  });

  it('creates doneAt from archivedAt on up, and empties archivedAt', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await hasDoneAtField()).toBe(true);
    expect(await hasInboxState()).toBe(true);
    expect(await readParticipants('"doneAt", "archivedAt"')).toEqual(
      [
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          doneAt: DONE_AT,
          archivedAt: null,
        },
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
          doneAt: null,
          archivedAt: null,
        },
      ].sort((a, b) => a.workspaceMemberId.localeCompare(b.workspaceMemberId)),
    );
  });

  it('keeps a done state cleared since when it runs again', async () => {
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThreadParticipant" SET "doneAt" = NULL
       WHERE "threadId" = $1`,
      [threadId],
    );

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readParticipants('"doneAt"')).toEqual([
      expect.objectContaining({ doneAt: null }),
      expect.objectContaining({ doneAt: null }),
    ]);
  });
});
