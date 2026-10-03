import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { touchAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/touch-agent-chat-thread.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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
  }: Omit<AgentChatThreadAccessArgs, 'threadId'>): Promise<
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

  async markAsRead(
    args: AgentChatThreadAccessArgs,
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
    args: AgentChatThreadAccessArgs,
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

  archive(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.setArchive(args, null);
  }

  async snooze({
    snoozedUntil,
    ...args
  }: AgentChatThreadAccessArgs & {
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
    args: AgentChatThreadAccessArgs,
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
    text,
  }: AgentChatThreadAccessArgs & {
    text: string;
  }): Promise<AgentChatThreadActivity> {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return (
        (await touchAgentChatThread({
          repository: this.threadRepository,
          workspaceId,
          threadId,
        })) ?? throwAgentChatThreadNotFound()
      );
    }

    const participantTable = getAgentChatThreadParticipantTable(workspaceId);

    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<AgentChatThreadActivity[]>(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')}
             SET "updatedAt" = now(),
               ${buildAgentChatThreadActivitySetClause({ textParameter: '$3', senderWorkspaceMemberIdParameter: '$2::uuid' })},
               "writerWorkspaceMemberIds" = CASE
                 WHEN $2::uuid::text = ANY(COALESCE("writerWorkspaceMemberIds", '{}')) THEN "writerWorkspaceMemberIds"
                 ELSE array_append(COALESCE("writerWorkspaceMemberIds", '{}'), $2::uuid::text)
               END
             WHERE id = $1
             RETURNING id, ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS}
           ), participant AS (
             INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
             SELECT thread.id, $2, thread."lastActivityAt" FROM thread
             ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
               "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
               "archivedAt" = NULL,
               "snoozedUntil" = NULL,
               "updatedAt" = now()
           )
           SELECT ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS} FROM thread`,
          [threadId, workspaceMemberId, text],
        ),
    );

    if (rows.length !== 1) {
      return throwAgentChatThreadNotFound();
    }

    return rows[0];
  }

  private setArchive(
    args: AgentChatThreadAccessArgs,
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
    { workspaceId, workspaceMemberId, threadId }: AgentChatThreadAccessArgs,
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
      throwAgentChatThreadNotFound();
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
      return throwAgentChatThreadNotFound();
    }

    return rows[0];
  }
}
