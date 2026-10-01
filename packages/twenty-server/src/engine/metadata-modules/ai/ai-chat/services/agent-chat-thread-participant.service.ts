import { Injectable } from '@nestjs/common';

import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { hasAgentChatThreadInboxState } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-agent-chat-thread-inbox-state.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ParticipantArgs = {
  workspaceId: string;
  workspaceMemberId: string;
  threadId: string;
};

const PARTICIPANT_COLUMNS = `"threadId", "lastReadAt", "archivedAt", "snoozedUntil"`;

// Timestamps compared against thread.lastActivityAt are stamped by Postgres
// (clock_timestamp), so ordering follows the database rather than app servers
@Injectable()
export class AgentChatThreadParticipantService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async hasInboxState(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return hasAgentChatThreadInboxState(flatObjectMetadataMaps);
  }

  // A member keeps their row after losing access to a thread, so rows are
  // only returned for threads they can still read
  async findForWorkspaceMember({
    workspaceId,
    workspaceMemberId,
  }: Omit<ParticipantArgs, 'threadId'>): Promise<
    AgentChatThreadParticipantRow[]
  > {
    if (!(await this.hasInboxState(workspaceId))) {
      return [];
    }

    const rows = await this.threadRepository.query(workspaceId, ({ manager }) =>
      manager.query<AgentChatThreadParticipantRow[]>(
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
    args: ParticipantArgs,
  ): Promise<AgentChatThreadParticipantRow> {
    await this.sharingService.getReadableThread(args);

    // Read up to what the thread holds now, never past it, and never back
    return this.upsertOne(
      args.workspaceId,
      ({ participantTable, threadTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
         SELECT thread.id, $2, thread."lastActivityAt" FROM ${threadTable} thread WHERE thread.id = $1
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
      [args.threadId, args.workspaceMemberId],
    );
  }

  async markAsUnread(
    args: ParticipantArgs,
  ): Promise<AgentChatThreadParticipantRow> {
    await this.sharingService.getReadableThread(args);

    return this.upsertOne(
      args.workspaceId,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
         VALUES ($1, $2, NULL)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = NULL,
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
      [args.threadId, args.workspaceMemberId],
    );
  }

  async archive(args: ParticipantArgs): Promise<AgentChatThreadParticipantRow> {
    await this.sharingService.getReadableThread(args);

    return this.setArchive(args, null);
  }

  async snooze({
    snoozedUntil,
    ...args
  }: ParticipantArgs & {
    snoozedUntil: Date;
  }): Promise<AgentChatThreadParticipantRow> {
    if (snoozedUntil.getTime() <= Date.now()) {
      throw new AiException(
        'Snooze time must be in the future',
        AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
      );
    }

    await this.sharingService.getReadableThread(args);

    return this.setArchive(args, snoozedUntil);
  }

  async moveToInbox(
    args: ParticipantArgs,
  ): Promise<AgentChatThreadParticipantRow> {
    await this.sharingService.getReadableThread(args);

    return this.upsertOne(
      args.workspaceId,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
         VALUES ($1, $2)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "archivedAt" = NULL,
           "snoozedUntil" = NULL,
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
      [args.threadId, args.workspaceMemberId],
    );
  }

  // A member who writes in a thread has read it and wants it back in their
  // inbox, so their cursor follows the activity they just created
  async recordMemberActivity({
    workspaceId,
    workspaceMemberId,
    threadId,
  }: ParticipantArgs): Promise<{
    lastActivityAt: Date | null;
    updatedAt: Date;
  }> {
    if (!(await this.hasInboxState(workspaceId))) {
      return this.touchThread({ workspaceId, threadId });
    }

    const participantTable = getAgentChatThreadParticipantTable(workspaceId);

    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ lastActivityAt: Date; updatedAt: Date }[]>(
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

  // Activity no member wrote, such as an agent reply saved after its stream
  // lost the thread to a newer one
  async recordThreadActivity({
    workspaceId,
    threadId,
  }: Omit<ParticipantArgs, 'workspaceMemberId'>): Promise<void> {
    if (!(await this.hasInboxState(workspaceId))) {
      return;
    }

    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentChatThread')}
         SET "lastActivityAt" = clock_timestamp(), "updatedAt" = now()
         WHERE id = $1`,
        [threadId],
      ),
    );
  }

  private async touchThread({
    workspaceId,
    threadId,
  }: Omit<ParticipantArgs, 'workspaceMemberId'>): Promise<{
    lastActivityAt: null;
    updatedAt: Date;
  }> {
    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ updatedAt: Date }[]>(
          `WITH thread AS (
             UPDATE ${table('agentChatThread')} SET "updatedAt" = now()
             WHERE id = $1 RETURNING "updatedAt"
           )
           SELECT "updatedAt" FROM thread`,
          [threadId],
        ),
    );

    if (rows.length !== 1) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    return { lastActivityAt: null, updatedAt: rows[0].updatedAt };
  }

  private setArchive(
    args: ParticipantArgs,
    snoozedUntil: Date | null,
  ): Promise<AgentChatThreadParticipantRow> {
    return this.upsertOne(
      args.workspaceId,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "archivedAt", "snoozedUntil")
         VALUES ($1, $2, clock_timestamp(), $3)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "archivedAt" = EXCLUDED."archivedAt",
           "snoozedUntil" = EXCLUDED."snoozedUntil",
           "updatedAt" = now()
         RETURNING ${PARTICIPANT_COLUMNS}`,
      [args.threadId, args.workspaceMemberId, snoozedUntil],
    );
  }

  private async upsertOne(
    workspaceId: string,
    buildQuery: (tables: {
      participantTable: string;
      threadTable: string;
    }) => string,
    parameters: unknown[],
  ): Promise<AgentChatThreadParticipantRow> {
    if (!(await this.hasInboxState(workspaceId))) {
      throw new AiException(
        'Chat inbox state is not available until this workspace finishes upgrading',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const rows = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<AgentChatThreadParticipantRow[]>(
          buildQuery({
            participantTable: getAgentChatThreadParticipantTable(workspaceId),
            threadTable: table('agentChatThread'),
          }),
          parameters,
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
