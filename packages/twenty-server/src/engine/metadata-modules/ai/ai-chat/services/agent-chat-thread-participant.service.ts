import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { type AgentChatThreadPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-preview.dto';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type ParticipantArgs = {
  workspaceId: string;
  workspaceMemberId: string;
  threadId: string;
};

type ThreadActivityTimestamps = {
  lastActivityAt: Date | null;
  updatedAt: Date;
};

const PREVIEW_TEXT_MAX_LENGTH = 280;

const PARTICIPANT_COLUMNS = `"threadId", "lastReadAt", "archivedAt", "snoozedUntil"`;

// Timestamps compared against thread.lastActivityAt are stamped by Postgres
// (clock_timestamp), so ordering follows the database rather than app servers
@Injectable()
export class AgentChatThreadParticipantService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
  ) {}

  // A member keeps their row after losing access to a thread, so rows are
  // only returned for threads they can still read
  async findForWorkspaceMember({
    workspaceId,
    workspaceMemberId,
  }: Omit<ParticipantArgs, 'threadId'>): Promise<
    AgentChatThreadParticipantDTO[]
  > {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return [];
    }

    const rows = await this.threadRepository.query(workspaceId, ({ manager }) =>
      manager.query<AgentChatThreadParticipantDTO[]>(
        `SELECT ${PARTICIPANT_COLUMNS}
         FROM ${getAgentChatThreadParticipantTable(workspaceId)}
         WHERE "workspaceMemberId" = $1`,
        [workspaceMemberId],
      ),
    );

    const readableThreadIds = new Set(
      await this.sharingService.findReadableThreadIds({
        workspaceId,
        workspaceMemberId,
        threadIds: rows.map(({ threadId }) => threadId),
      }),
    );

    return rows.filter(({ threadId }) => readableThreadIds.has(threadId));
  }

  // A user message without a sender predates multiplayer chats, when every
  // user message was the owner's
  async findPreviewsForThreads({
    workspaceId,
    workspaceMemberId,
    threadIds,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    threadIds: string[];
  }): Promise<AgentChatThreadPreviewDTO[]> {
    const readableThreadIds = await this.sharingService.findReadableThreadIds({
      workspaceId,
      workspaceMemberId,
      threadIds,
    });

    if (readableThreadIds.length === 0) {
      return [];
    }

    return this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query<AgentChatThreadPreviewDTO[]>(
        `SELECT thread.id AS "threadId",
           last_message.role AS "lastMessageRole",
           left(last_text."textContent", $2) AS "lastMessageText",
           last_message."senderWorkspaceMemberId" AS "lastMessageSenderWorkspaceMemberId",
           COALESCE(member."memberIds", ARRAY[]::uuid[]) AS "memberIds"
         FROM ${table('agentChatThread')} thread
         LEFT JOIN LATERAL (
           SELECT message.id, message.role,
             CASE WHEN message.role = 'user'
               THEN COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")
             END AS "senderWorkspaceMemberId"
           FROM ${table('agentMessage')} message
           WHERE message."threadId" = thread.id
             AND message."deletedAt" IS NULL
             AND message."isHidden" = false
             AND message.role IN ('user', 'assistant')
           ORDER BY message."createdAt" DESC, message.id DESC
           LIMIT 1
         ) last_message ON true
         LEFT JOIN LATERAL (
           SELECT part."textContent"
           FROM ${table('agentMessagePart')} part
           WHERE part."messageId" = last_message.id
             AND part.type = 'text'
             AND btrim(coalesce(part."textContent", '')) <> ''
           ORDER BY part."orderIndex" DESC
           LIMIT 1
         ) last_text ON true
         LEFT JOIN LATERAL (
           SELECT array_remove(
             array_agg(DISTINCT COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")),
             NULL
           ) AS "memberIds"
           FROM ${table('agentMessage')} message
           WHERE message."threadId" = thread.id
             AND message."deletedAt" IS NULL
             AND message."isHidden" = false
             AND message.role = 'user'
         ) member ON true
         WHERE thread.id = ANY($1)`,
        [readableThreadIds, PREVIEW_TEXT_MAX_LENGTH],
      ),
    );
  }

  async markAsRead(
    args: ParticipantArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    // Read up to what the thread holds now, never past it, and never back
    return this.upsertOne(
      args,
      ({ participantTable, threadTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
         SELECT thread.id, $2, thread."lastActivityAt" FROM ${threadTable} thread WHERE thread.id = $1
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
    );
  }

  async markAsUnread(
    args: ParticipantArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
         VALUES ($1, $2, NULL)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = NULL,
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
    );
  }

  archive(args: ParticipantArgs): Promise<AgentChatThreadParticipantDTO> {
    return this.setArchive(args, null);
  }

  async snooze({
    snoozedUntil,
    ...args
  }: ParticipantArgs & {
    snoozedUntil: Date;
  }): Promise<AgentChatThreadParticipantDTO> {
    if (snoozedUntil.getTime() <= Date.now()) {
      throw new AiException(
        'Snooze time must be in the future',
        AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
      );
    }

    return this.setArchive(args, snoozedUntil);
  }

  async moveToInbox(
    args: ParticipantArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
         VALUES ($1, $2)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "archivedAt" = NULL,
           "snoozedUntil" = NULL,
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
    );
  }

  // A member who writes in a thread has read it and wants it back in their
  // inbox, so their cursor follows the activity they just created
  async recordMemberActivity({
    workspaceId,
    workspaceMemberId,
    threadId,
  }: ParticipantArgs): Promise<ThreadActivityTimestamps> {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      const activity = await this.touchThread({ workspaceId, threadId });

      if (!isDefined(activity)) {
        throw new AiException(
          'Thread not found',
          AiExceptionCode.THREAD_NOT_FOUND,
        );
      }

      return activity;
    }

    const participantTable = getAgentChatThreadParticipantTable(workspaceId);

    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<ThreadActivityTimestamps[]>(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')}
             SET "lastActivityAt" = clock_timestamp(), "updatedAt" = now()
             WHERE id = $1
             RETURNING id, "lastActivityAt", "updatedAt"
           ), participant AS (
             INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
             SELECT thread.id, $2, thread."lastActivityAt" FROM thread
             ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
               "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
               "archivedAt" = NULL,
               "snoozedUntil" = NULL,
               "updatedAt" = now()
           )
           SELECT "lastActivityAt", "updatedAt" FROM thread`,
          [threadId, workspaceMemberId],
        ),
    );

    if (rows.length !== 1) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    return rows[0];
  }

  async recordThreadActivity({
    workspaceId,
    threadId,
  }: Omit<
    ParticipantArgs,
    'workspaceMemberId'
  >): Promise<ThreadActivityTimestamps | null> {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return this.touchThread({ workspaceId, threadId });
    }

    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<ThreadActivityTimestamps[]>(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')}
             SET "lastActivityAt" = clock_timestamp(), "updatedAt" = now()
             WHERE id = $1
             RETURNING "lastActivityAt", "updatedAt"
           )
           SELECT "lastActivityAt", "updatedAt" FROM thread`,
          [threadId],
        ),
    );

    return rows[0] ?? null;
  }

  // Before the 2.45 upgrade only updatedAt exists to order chats by
  private async touchThread({
    workspaceId,
    threadId,
  }: Omit<
    ParticipantArgs,
    'workspaceMemberId'
  >): Promise<ThreadActivityTimestamps | null> {
    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<ThreadActivityTimestamps[]>(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')}
             SET "updatedAt" = now()
             WHERE id = $1
             RETURNING NULL::timestamptz AS "lastActivityAt", "updatedAt"
           )
           SELECT "lastActivityAt", "updatedAt" FROM thread`,
          [threadId],
        ),
    );

    return rows[0] ?? null;
  }

  private setArchive(
    args: ParticipantArgs,
    snoozedUntil: Date | null,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "archivedAt", "snoozedUntil")
         VALUES ($1, $2, clock_timestamp(), $3)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "archivedAt" = EXCLUDED."archivedAt",
           "snoozedUntil" = EXCLUDED."snoozedUntil",
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
      [snoozedUntil],
    );
  }

  private async upsertOne(
    { workspaceId, workspaceMemberId, threadId }: ParticipantArgs,
    buildQuery: (tables: {
      participantTable: string;
      threadTable: string;
    }) => string,
    extraParameters: unknown[] = [],
  ): Promise<AgentChatThreadParticipantDTO> {
    const [readableThreadId] = await this.sharingService.findReadableThreadIds({
      workspaceId,
      workspaceMemberId,
      threadIds: [threadId],
    });

    if (!isDefined(readableThreadId)) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      throw new AiException(
        'Chat inbox state is not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE,
      );
    }

    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<AgentChatThreadParticipantDTO[]>(
          buildQuery({
            participantTable: getAgentChatThreadParticipantTable(workspaceId),
            threadTable: table('agentChatThread'),
          }),
          [threadId, workspaceMemberId, ...extraParameters],
        ),
    );

    if (rows.length !== 1) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    return rows[0];
  }
}
