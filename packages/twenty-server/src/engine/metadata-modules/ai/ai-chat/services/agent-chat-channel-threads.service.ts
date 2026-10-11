import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_THREAD_PREDICATES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-thread-predicates.constant';
import {
  AGENT_CHAT_CHANNEL_THREADS_DEFAULT_PAGE_SIZE,
  AGENT_CHAT_CHANNEL_THREADS_MAX_PAGE_SIZE,
} from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-threads-page-size.constant';
import { type AgentChatChannelSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-summary.dto';
import { type AgentChatChannelThreadIdsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-thread-ids.dto';
import { AgentChatChannelAssignmentFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-assignment-filter.enum';
import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-thread-cursor.type';
import { buildAgentChatJoinedChannelsQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-joined-channels-query.util';
import { decodeAgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/decode-agent-chat-channel-thread-cursor.util';
import { encodeAgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/encode-agent-chat-channel-thread-cursor.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const { IS_UNREAD, STATUS } = AGENT_CHAT_CHANNEL_THREAD_PREDICATES;

type MemberArgs = {
  workspaceId: string;
  workspaceMemberId: string;
};

type ReadableThreadsQuery = (readableThreads: {
  fromClause: string;
  parameters: Record<string, unknown>;
}) => { sql: string; parameters: Record<string, unknown> };

const ASSIGNMENT_FILTERS: Record<AgentChatChannelAssignmentFilter, string> = {
  [AgentChatChannelAssignmentFilter.ANY]: '',
  [AgentChatChannelAssignmentFilter.UNASSIGNED]: `AND thread."assigneeId" IS NULL`,
  [AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME]: `AND thread."assigneeId" = :channelThreadsWorkspaceMemberId::uuid`,
};

// Chats without activity sort last, so a cursor on one only moves through
// the other chats without activity
const buildCursorFilter = (
  cursor: AgentChatChannelThreadCursor | null,
): string => {
  if (!isDefined(cursor)) {
    return '';
  }

  if (!isDefined(cursor.lastActivityAt)) {
    return `AND thread."lastActivityAt" IS NULL AND thread.id < :channelThreadsCursorId::uuid`;
  }

  return `AND (thread."lastActivityAt" < :channelThreadsCursorLastActivityAt::timestamptz
    OR (thread."lastActivityAt" = :channelThreadsCursorLastActivityAt::timestamptz AND thread.id < :channelThreadsCursorId::uuid)
    OR thread."lastActivityAt" IS NULL)`;
};

// Lists and counts are worked out here rather than on the client, which
// cannot load every chat of every public channel to sort them. Only chats the
// member can read are considered, through the same row level permissions as
// the record API.
@Injectable()
export class AgentChatChannelThreadsService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findThreadIds({
    channelId,
    status,
    assignment,
    first,
    after,
    ...args
  }: MemberArgs & {
    channelId: string;
    status: AgentChatChannelThreadStatus | null;
    assignment: AgentChatChannelAssignmentFilter | null;
    first: number | null;
    after: string | null;
  }): Promise<AgentChatChannelThreadIdsDTO> {
    const pageSize = Math.min(
      Math.max(first ?? AGENT_CHAT_CHANNEL_THREADS_DEFAULT_PAGE_SIZE, 1),
      AGENT_CHAT_CHANNEL_THREADS_MAX_PAGE_SIZE,
    );
    const cursor = isDefined(after)
      ? decodeAgentChatChannelThreadCursor(after)
      : null;

    await this.assertHasChannels(args.workspaceId);

    await this.channelAccessService.assertChannelAccess({
      ...args,
      channelId,
      operationType: 'select',
    });

    const rows = await this.queryReadableThreads<{
      id: string;
      lastActivityAt: string | null;
    }>(args, ({ fromClause, parameters }) => ({
      sql: `SELECT thread.id,
              to_char(thread."lastActivityAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "lastActivityAt"
            ${fromClause}
            AND thread."channelId" = :channelThreadsChannelId::uuid
            AND ${STATUS[status ?? AgentChatChannelThreadStatus.OPEN]}
            ${ASSIGNMENT_FILTERS[assignment ?? AgentChatChannelAssignmentFilter.ANY]}
            ${buildCursorFilter(cursor)}
            ORDER BY thread."lastActivityAt" DESC NULLS LAST, thread.id DESC
            LIMIT :channelThreadsLimit`,
      parameters: {
        ...parameters,
        channelThreadsChannelId: channelId,
        channelThreadsCursorLastActivityAt: cursor?.lastActivityAt,
        channelThreadsCursorId: cursor?.id,
        channelThreadsLimit: pageSize + 1,
      },
    }));

    const pageRows = rows.slice(0, pageSize);
    const lastRow = pageRows[pageRows.length - 1];

    return {
      threadIds: pageRows.map(({ id }) => id),
      hasNextPage: rows.length > pageSize,
      endCursor: isDefined(lastRow)
        ? encodeAgentChatChannelThreadCursor(lastRow)
        : null,
    };
  }

  // One per channel the member is in, in their sidebar order
  async findSummaries(args: MemberArgs): Promise<AgentChatChannelSummaryDTO[]> {
    if (!(await this.sharingService.hasChannels(args.workspaceId))) {
      return [];
    }

    const { channelTable } = getAgentChatChannelTables(args.workspaceId);
    const roleId = await this.channelAccessService.findMemberRoleId(args);

    return this.queryReadableThreads<{
      channelId: string;
      openCount: number;
      hasUnreadOpen: boolean;
    }>(args, ({ fromClause, parameters }) => ({
      sql: `WITH channel_thread AS (
              SELECT thread."channelId",
                count(*) FILTER (WHERE ${STATUS.OPEN})::int AS "openCount",
                COALESCE(bool_or(${STATUS.OPEN} AND ${IS_UNREAD}), false) AS "hasUnreadOpen"
              ${fromClause}
              AND thread."channelId" IS NOT NULL
              GROUP BY thread."channelId"
            )
            SELECT joined_channel."channelId",
              COALESCE(channel_thread."openCount", 0) AS "openCount",
              COALESCE(channel_thread."hasUnreadOpen", false) AS "hasUnreadOpen"
            FROM (${buildAgentChatJoinedChannelsQuery({
              workspaceId: args.workspaceId,
              workspaceMemberIdParameter:
                ':channelThreadsWorkspaceMemberId::uuid',
              roleIdParameter: ':channelThreadsRoleId::uuid',
            })}) joined_channel
            JOIN ${channelTable} channel
              ON channel.id = joined_channel."channelId" AND channel."deletedAt" IS NULL
            LEFT JOIN channel_thread ON channel_thread."channelId" = joined_channel."channelId"
            ORDER BY joined_channel.position NULLS LAST, lower(channel.name), channel.id`,
      parameters: { ...parameters, channelThreadsRoleId: roleId ?? null },
    }));
  }

  private async assertHasChannels(workspaceId: string): Promise<void> {
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      throw new AiException(
        'Chat channels are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_CHANNELS_UNAVAILABLE,
      );
    }
  }

  // The readable chats come from the record API's row level permissions,
  // compiled into a subquery so the list is filtered and paged in one query
  private async queryReadableThreads<TRow extends Record<string, unknown>>(
    args: MemberArgs,
    buildQuery: ReadableThreadsQuery,
  ): Promise<TRow[]> {
    const authContext = await this.sharingService.getAuthContext(args);
    const schema = escapeIdentifier(getWorkspaceSchemaName(args.workspaceId));

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          'agentChatThread',
        );
      const readableThreadQueryBuilder = repository
        .createQueryBuilder('readableThread')
        .select('"readableThread"."id"', 'id')
        .applyRowLevelPermissions();

      const { sql, parameters } = buildQuery({
        fromClause: `FROM ${schema}."agentChatThread" thread
          LEFT JOIN ${getAgentChatThreadParticipantTable(args.workspaceId)} participant
            ON participant."threadId" = thread.id
            AND participant."workspaceMemberId" = :channelThreadsWorkspaceMemberId::uuid
          WHERE thread."deletedAt" IS NULL
            AND thread.id IN (${readableThreadQueryBuilder.getQuery()})`,
        parameters: {
          ...readableThreadQueryBuilder.getParameters(),
          channelThreadsWorkspaceMemberId: args.workspaceMemberId,
        },
      });

      return repository.executeRaw<TRow>(sql, parameters);
    }, authContext);
  }
}
