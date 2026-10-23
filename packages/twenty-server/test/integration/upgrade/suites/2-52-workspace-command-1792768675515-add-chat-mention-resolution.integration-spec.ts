import { randomUUID } from 'node:crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddChatMentionResolutionCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792768675515-add-chat-mention-resolution.command';
import { type AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
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
const MENTIONED_AT = '2026-10-01T10:00:00.000Z';
const REPLIED_AT = '2026-10-01T11:00:00.000Z';
const OLDER_REPLY_AT = '2026-10-01T09:00:00.000Z';
const RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastResolvedMentionAt
    .universalIdentifier;

describe('2-52 workspace command - add chat mention resolution (integration)', () => {
  let command: AddChatMentionResolutionCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let sharingService: AgentChatSharingService;
  const threadIds: string[] = [];
  const participantIds: string[] = [];

  const findResolutionMetadata = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);
    const columns: { column_name: string }[] =
      await global.testDataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'agentChatThreadParticipant'
           AND column_name = 'lastResolvedMentionAt'`,
        [SCHEMA],
      );

    return {
      hasField: isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER
        ],
      ),
      hasColumn: columns.length === 1,
    };
  };

  const createHistoricalMention = async ({
    lastReadAt = null,
    participantDeletedAt = null,
    reply,
  }: {
    lastReadAt?: string | null;
    participantDeletedAt?: string | null;
    reply?: {
      createdAt: string;
      senderWorkspaceMemberId: string;
      deletedAt?: string | null;
      role?: 'user' | 'assistant';
      agentId?: string | null;
      hasTurn?: boolean;
      turnDeletedAt?: string | null;
    };
  }): Promise<string> => {
    const threadId = randomUUID();
    const participantId = randomUUID();

    threadIds.push(threadId);
    participantIds.push(participantId);

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThread" (id, "workspaceMemberId")
       VALUES ($1, $2)`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentChatThreadParticipant"
         (id, "threadId", "workspaceMemberId", "lastMentionedAt", "lastReadAt", "deletedAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        participantId,
        threadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        MENTIONED_AT,
        lastReadAt,
        participantDeletedAt,
      ],
    );

    if (!isDefined(reply)) {
      return participantId;
    }

    const turnId = reply.hasTurn === false ? null : randomUUID();

    if (isDefined(turnId)) {
      await global.testDataSource.query(
        `INSERT INTO ${SCHEMA}."agentTurn"
           (id, "threadId", "agentId", status, "deletedAt")
         VALUES ($1, $2, $3, 'completed', $4)`,
        [turnId, threadId, reply.agentId ?? null, reply.turnDeletedAt ?? null],
      );
    }

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."agentMessage"
         (id, "threadId", "senderWorkspaceMemberId", role, status, "createdAt", "deletedAt", "turnId")
       VALUES ($1, $2, $3, $4, 'sent', $5, $6, $7)`,
      [
        randomUUID(),
        threadId,
        reply.senderWorkspaceMemberId,
        reply.role ?? 'user',
        reply.createdAt,
        reply.deletedAt ?? null,
        turnId,
      ],
    );

    return participantId;
  };

  const readResolutions = async () => {
    const rows: {
      id: string;
      lastResolvedMentionAt: Date | null;
      updatedAt: Date;
    }[] = await global.testDataSource.query(
      `SELECT id, "lastResolvedMentionAt", "updatedAt"
       FROM ${SCHEMA}."agentChatThreadParticipant"
       WHERE id = ANY($1::uuid[]) ORDER BY id`,
      [participantIds],
    );

    return rows.map(({ id, lastResolvedMentionAt, updatedAt }) => ({
      id,
      lastResolvedMentionAt: lastResolvedMentionAt?.toISOString() ?? null,
      updatedAt: updatedAt.toISOString(),
    }));
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddChatMentionResolutionCommand>(
      'AddChatMentionResolutionCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    sharingService = getAppProviderByClassName<AgentChatSharingService>(
      'AgentChatSharingService',
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentMessage" WHERE "threadId" = ANY($1::uuid[])`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentTurn" WHERE "threadId" = ANY($1::uuid[])`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = ANY($1::uuid[])`,
      [threadIds],
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1::uuid[])`,
      [threadIds],
    );
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('removes the field and column on down, and fences participant access', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findResolutionMetadata()).toEqual({
      hasField: false,
      hasColumn: false,
    });
    await expect(
      sharingService.getParticipantObjectMetadataId(SEED_APPLE_WORKSPACE_ID),
    ).rejects.toMatchObject({ code: 'WORKSPACE_UPGRADE_REQUIRED' });
  });

  it('leaves the field absent on a dry run', async () => {
    await command.up({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun: true } });

    expect(await findResolutionMetadata()).toEqual({
      hasField: false,
      hasColumn: false,
    });
  });

  it('adds the field and resolves only retained replies authored by the recipient after their mention', async () => {
    const recipientReply = {
      createdAt: REPLIED_AT,
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    };
    const resolvedParticipantId = await createHistoricalMention({
      reply: recipientReply,
    });
    const unresolvedParticipantIds = [
      await createHistoricalMention({ lastReadAt: REPLIED_AT }),
      await createHistoricalMention({
        reply: {
          ...recipientReply,
          senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
      await createHistoricalMention({
        reply: { ...recipientReply, createdAt: OLDER_REPLY_AT },
      }),
      await createHistoricalMention({
        reply: { ...recipientReply, deletedAt: REPLIED_AT },
      }),
      await createHistoricalMention({
        reply: { ...recipientReply, role: 'assistant' },
      }),
      await createHistoricalMention({
        participantDeletedAt: REPLIED_AT,
        reply: recipientReply,
      }),
      await createHistoricalMention({
        reply: { ...recipientReply, agentId: randomUUID() },
      }),
      await createHistoricalMention({
        reply: { ...recipientReply, hasTurn: false },
      }),
      await createHistoricalMention({
        reply: { ...recipientReply, turnDeletedAt: REPLIED_AT },
      }),
    ];

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findResolutionMetadata()).toEqual({
      hasField: true,
      hasColumn: true,
    });
    expect(await readResolutions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: resolvedParticipantId,
          lastResolvedMentionAt: MENTIONED_AT,
        }),
        ...unresolvedParticipantIds.map((id) =>
          expect.objectContaining({ id, lastResolvedMentionAt: null }),
        ),
      ]),
    );
    await expect(
      sharingService.getParticipantObjectMetadataId(SEED_APPLE_WORKSPACE_ID),
    ).resolves.toEqual(expect.any(String));
  });

  it('preserves resolution cursors and row versions when repeated', async () => {
    const resolutions = await readResolutions();

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readResolutions()).toEqual(resolutions);
  });
});
