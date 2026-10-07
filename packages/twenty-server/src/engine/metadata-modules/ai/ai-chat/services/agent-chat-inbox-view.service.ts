import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  AGENT_CHAT_INBOX_VIEW_DEFAULT_PAGE_SIZE,
  AGENT_CHAT_INBOX_VIEW_MAX_PAGE_SIZE,
} from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-inbox-view-page-size.constant';
import { AGENT_CHAT_INBOX_VIEW_PREDICATES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-inbox-view-predicates.constant';
import { type AgentChatInboxSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-inbox-summary.dto';
import { type AgentChatInboxThreadIdsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-inbox-thread-ids.dto';
import { type AgentChatInboxViewInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-inbox-view.input';
import { AgentChatChannelAssignmentFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-assignment-filter.enum';
import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';
import { AgentChatInboxViewKind } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-view-kind.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { decodeAgentChatInboxViewCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/decode-agent-chat-inbox-view-cursor.util';
import { encodeAgentChatInboxViewCursor } from 'src/engine/metadata-modules/ai/ai-chat/utils/encode-agent-chat-inbox-view-cursor.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const {
  IS_MINE,
  IS_OPEN,
  IS_SNOOZED,
  IS_DONE,
  IS_UNREAD,
  IS_OPEN_IN_CHANNEL,
  IS_SNOOZED_IN_CHANNEL,
  IS_DONE_IN_CHANNEL,
} = AGENT_CHAT_INBOX_VIEW_PREDICATES;

type InboxViewArgs = {
  workspaceId: string;
  workspaceMemberId: string;
};

type ReadableThreadsQuery = (readableThreads: {
  fromClause: string;
  parameters: Record<string, unknown>;
}) => { sql: string; parameters: Record<string, unknown> };

const CHANNEL_STATUS_PREDICATES: Record<AgentChatChannelThreadStatus, string> =
  {
    [AgentChatChannelThreadStatus.OPEN]: IS_OPEN_IN_CHANNEL,
    [AgentChatChannelThreadStatus.SNOOZED]: IS_SNOOZED_IN_CHANNEL,
    [AgentChatChannelThreadStatus.DONE]: IS_DONE_IN_CHANNEL,
  };

// Chats without activity sort last, so a cursor on one only moves through
// the other chats without activity
const buildInboxViewCursorFilter = (
  cursor: ReturnType<typeof decodeAgentChatInboxViewCursor> | null,
): string => {
  if (!isDefined(cursor)) {
    return '';
  }

  if (!isDefined(cursor.lastActivityAt)) {
    return `AND thread."lastActivityAt" IS NULL AND thread.id < :inboxViewCursorId::uuid`;
  }

  return `AND (thread."lastActivityAt" < :inboxViewCursorLastActivityAt::timestamptz
    OR (thread."lastActivityAt" = :inboxViewCursorLastActivityAt::timestamptz AND thread.id < :inboxViewCursorId::uuid)
    OR thread."lastActivityAt" IS NULL)`;
};

// Lists and counts are worked out here rather than on the client, which
// cannot load every chat of every public channel to sort them. Only chats the
// member can read are considered, through the same row level permissions as
// the record API.
@Injectable()
export class AgentChatInboxViewService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findThreadIds({
    view,
    first,
    after,
    ...args
  }: InboxViewArgs & {
    view: AgentChatInboxViewInput;
    first?: number | null;
    after?: string | null;
  }): Promise<AgentChatInboxThreadIdsDTO> {
    const pageSize = Math.min(
      Math.max(first ?? AGENT_CHAT_INBOX_VIEW_DEFAULT_PAGE_SIZE, 1),
      AGENT_CHAT_INBOX_VIEW_MAX_PAGE_SIZE,
    );
    const cursor = isDefined(after)
      ? decodeAgentChatInboxViewCursor(after)
      : null;

    await this.assertInboxViewsAvailable(args.workspaceId);

    const viewFilter = await this.buildViewFilter({ ...args, view });

    const cursorFilter = buildInboxViewCursorFilter(cursor);

    const rows = await this.queryReadableThreads<{
      id: string;
      lastActivityAt: string | null;
    }>(args, ({ fromClause, parameters }) => ({
      sql: `SELECT thread.id,
              to_char(thread."lastActivityAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "lastActivityAt"
            ${fromClause}
            AND ${viewFilter.sql}
            ${cursorFilter}
            ORDER BY thread."lastActivityAt" DESC NULLS LAST, thread.id DESC
            LIMIT :inboxViewLimit`,
      parameters: {
        ...parameters,
        ...viewFilter.parameters,
        inboxViewCursorLastActivityAt: cursor?.lastActivityAt,
        inboxViewCursorId: cursor?.id,
        inboxViewLimit: pageSize + 1,
      },
    }));

    const pageRows = rows.slice(0, pageSize);
    const lastRow = pageRows[pageRows.length - 1];

    return {
      threadIds: pageRows.map(({ id }) => id),
      hasNextPage: rows.length > pageSize,
      endCursor: isDefined(lastRow)
        ? encodeAgentChatInboxViewCursor(lastRow)
        : null,
    };
  }

  // Channels come in the member's sidebar order
  async getSummary(args: InboxViewArgs): Promise<AgentChatInboxSummaryDTO> {
    await this.assertInboxViewsAvailable(args.workspaceId);

    const [personalRows, channelRows] = await Promise.all([
      this.queryReadableThreads<{
        openCount: number;
        hasUnreadOpen: boolean;
        needsInputCount: number;
        hasUnreadMention: boolean;
        hasUnreadAssigned: boolean;
      }>(args, ({ fromClause, parameters }) => ({
        sql: `SELECT
                count(*) FILTER (WHERE ${IS_OPEN})::int AS "openCount",
                COALESCE(bool_or(${IS_OPEN} AND ${IS_UNREAD}), false) AS "hasUnreadOpen",
                count(*) FILTER (WHERE ${IS_OPEN} AND thread."pendingQuestionMessageId" IS NOT NULL)::int AS "needsInputCount",
                COALESCE(bool_or(${IS_OPEN} AND participant."lastMentionedAt" IS NOT NULL AND ${IS_UNREAD}), false) AS "hasUnreadMention",
                COALESCE(bool_or(${IS_OPEN} AND thread."assigneeId" = :inboxViewWorkspaceMemberId::uuid AND ${IS_UNREAD}), false) AS "hasUnreadAssigned"
              ${fromClause}`,
        parameters,
      })),
      this.queryReadableThreads<{
        channelId: string;
        openCount: number;
        hasUnreadOpen: boolean;
      }>(args, ({ fromClause, parameters }) => {
        const { channelTable, memberTable } = getAgentChatChannelTables(
          args.workspaceId,
        );

        return {
          sql: `WITH channel_thread AS (
                  SELECT thread."channelId",
                    count(*) FILTER (WHERE ${IS_OPEN_IN_CHANNEL})::int AS "openCount",
                    COALESCE(bool_or(${IS_OPEN_IN_CHANNEL} AND ${IS_UNREAD}), false) AS "hasUnreadOpen"
                  ${fromClause}
                  AND thread."channelId" IS NOT NULL
                  GROUP BY thread."channelId"
                )
                SELECT membership."channelId",
                  COALESCE(channel_thread."openCount", 0) AS "openCount",
                  COALESCE(channel_thread."hasUnreadOpen", false) AS "hasUnreadOpen"
                FROM ${memberTable} membership
                JOIN ${channelTable} channel
                  ON channel.id = membership."channelId" AND channel."deletedAt" IS NULL
                LEFT JOIN channel_thread ON channel_thread."channelId" = membership."channelId"
                WHERE membership."workspaceMemberId" = :inboxViewWorkspaceMemberId::uuid
                  AND membership."deletedAt" IS NULL
                ORDER BY membership.position, membership."createdAt"`,
          parameters,
        };
      }),
    ]);

    return { ...personalRows[0], channels: channelRows };
  }

  private async assertInboxViewsAvailable(workspaceId: string): Promise<void> {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      throw new AiException(
        'Chat inbox views are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE,
      );
    }
  }

  private async buildViewFilter({
    view,
    ...args
  }: InboxViewArgs & { view: AgentChatInboxViewInput }): Promise<{
    sql: string;
    parameters: Record<string, unknown>;
  }> {
    switch (view.kind) {
      case AgentChatInboxViewKind.RECENT:
        return { sql: IS_MINE, parameters: {} };
      case AgentChatInboxViewKind.OPEN:
        return { sql: IS_OPEN, parameters: {} };
      case AgentChatInboxViewKind.NEEDS_INPUT:
        return {
          sql: `${IS_OPEN} AND thread."pendingQuestionMessageId" IS NOT NULL`,
          parameters: {},
        };
      case AgentChatInboxViewKind.MENTIONS:
        return {
          sql: `${IS_OPEN} AND participant."lastMentionedAt" IS NOT NULL`,
          parameters: {},
        };
      case AgentChatInboxViewKind.ASSIGNED:
        return {
          sql: `${IS_OPEN} AND thread."assigneeId" = :inboxViewWorkspaceMemberId::uuid`,
          parameters: {},
        };
      case AgentChatInboxViewKind.SNOOZED:
        return { sql: IS_SNOOZED, parameters: {} };
      case AgentChatInboxViewKind.DONE:
        return { sql: IS_DONE, parameters: {} };
      case AgentChatInboxViewKind.CHANNEL: {
        if (!isDefined(view.channelId)) {
          throw new AiException(
            'A channel view needs a channel',
            AiExceptionCode.INVALID_CHAT_INBOX_VIEW,
          );
        }

        await this.channelAccessService.assertChannelAccess({
          ...args,
          channelId: view.channelId,
          operationType: 'select',
        });

        const assignmentFilter = {
          [AgentChatChannelAssignmentFilter.ANY]: '',
          [AgentChatChannelAssignmentFilter.UNASSIGNED]: `AND thread."assigneeId" IS NULL`,
          [AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME]: `AND thread."assigneeId" = :inboxViewWorkspaceMemberId::uuid`,
        }[view.assignment ?? AgentChatChannelAssignmentFilter.ANY];

        return {
          sql: `thread."channelId" = :inboxViewChannelId::uuid
                AND ${CHANNEL_STATUS_PREDICATES[view.channelStatus ?? AgentChatChannelThreadStatus.OPEN]}
                ${assignmentFilter}`,
          parameters: { inboxViewChannelId: view.channelId },
        };
      }
    }
  }

  // The readable chats come from the record API's row level permissions,
  // compiled into a subquery so the view is filtered and paged in one query
  private async queryReadableThreads<TRow extends Record<string, unknown>>(
    args: InboxViewArgs,
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
            AND participant."workspaceMemberId" = :inboxViewWorkspaceMemberId::uuid
          WHERE thread."deletedAt" IS NULL
            AND thread.id IN (${readableThreadQueryBuilder.getQuery()})`,
        parameters: {
          ...readableThreadQueryBuilder.getParameters(),
          inboxViewWorkspaceMemberId: args.workspaceMemberId,
        },
      });

      return repository.executeRaw<TRow>(sql, parameters);
    }, authContext);
  }
}
