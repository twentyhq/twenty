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
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { buildAgentChatChannelThreadCursorFilter } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-thread-cursor-filter.util';
import { decodeAgentChatChannelThreadCursorOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/decode-agent-chat-channel-thread-cursor-or-throw.util';
import { encodeAgentChatChannelThreadCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/encode-agent-chat-channel-thread-cursor.util';
import { throwAgentChatChannelsUnavailable } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channels-unavailable.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const { IS_UNREAD, STATUS } = AGENT_CHAT_CHANNEL_THREAD_PREDICATES;

type MemberArgs = Omit<AgentChatThreadAccessArgs, 'threadId'>;

type ReadableThreadsQuery = (readableThreads: {
  fromClause: string;
  parameters: Record<string, unknown>;
}) => { sql: string; parameters: Record<string, unknown> };

const ASSIGNMENT_FILTERS: Record<AgentChatChannelAssignmentFilter, string> = {
  [AgentChatChannelAssignmentFilter.ANY]: '',
  [AgentChatChannelAssignmentFilter.UNASSIGNED]: `AND thread."assigneeId" IS NULL`,
  [AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME]: `AND thread."assigneeId" = :channelThreadsWorkspaceMemberId::uuid`,
};

// Computed here because the client cannot load every chat of every channel to sort them
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
      ? decodeAgentChatChannelThreadCursorOrThrow(after)
      : null;

    if (!(await this.sharingService.hasChannels(args.workspaceId))) {
      throwAgentChatChannelsUnavailable();
    }

    await this.channelAccessService.assertChannelAccess({
      ...args,
      channelId,
    });

    const rows = await this.queryReadableThreads<{
      id: string;
      lastActivityAt: string | null;
    }>({
      ...args,
      buildQuery: ({ fromClause, parameters }) => ({
        sql: `SELECT thread.id,
              to_char(thread."lastActivityAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "lastActivityAt"
            ${fromClause}
            AND thread."channelId" = :channelThreadsChannelId::uuid
            AND ${STATUS[status ?? AgentChatChannelThreadStatus.OPEN]}
            ${ASSIGNMENT_FILTERS[assignment ?? AgentChatChannelAssignmentFilter.ANY]}
            ${buildAgentChatChannelThreadCursorFilter(cursor)}
            ORDER BY thread."lastActivityAt" DESC NULLS LAST, thread.id DESC
            LIMIT :channelThreadsLimit`,
        parameters: {
          ...parameters,
          channelThreadsChannelId: channelId,
          channelThreadsCursorLastActivityAt: cursor?.lastActivityAt,
          channelThreadsCursorId: cursor?.id,
          channelThreadsLimit: pageSize + 1,
        },
      }),
    });

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

  async findSummaries(args: MemberArgs): Promise<AgentChatChannelSummaryDTO[]> {
    if (!(await this.sharingService.hasChannels(args.workspaceId))) {
      return [];
    }

    const channels =
      await this.channelAccessService.findAccessibleChannels(args);

    if (channels.length === 0) {
      return [];
    }

    const counts = await this.queryReadableThreads<{
      channelId: string;
      openCount: number;
      hasUnreadOpen: boolean;
    }>({
      ...args,
      buildQuery: ({ fromClause, parameters }) => ({
        sql: `SELECT thread."channelId",
              count(*) FILTER (WHERE ${STATUS.OPEN})::int AS "openCount",
              COALESCE(bool_or(${STATUS.OPEN} AND ${IS_UNREAD}), false) AS "hasUnreadOpen"
            ${fromClause}
            AND thread."channelId" = ANY(:channelThreadsChannelIds::uuid[])
            GROUP BY thread."channelId"`,
        parameters: {
          ...parameters,
          channelThreadsChannelIds: channels.map(({ id }) => id),
        },
      }),
    });

    const countByChannelId = new Map(
      counts.map((count) => [count.channelId, count]),
    );

    return channels.map(({ id }) => ({
      channelId: id,
      openCount: countByChannelId.get(id)?.openCount ?? 0,
      hasUnreadOpen: countByChannelId.get(id)?.hasUnreadOpen ?? false,
    }));
  }

  // Row level permissions inlined as a subquery so filtering and paging stay one query
  private async queryReadableThreads<TRow extends Record<string, unknown>>({
    buildQuery,
    ...args
  }: MemberArgs & { buildQuery: ReadableThreadsQuery }): Promise<TRow[]> {
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
