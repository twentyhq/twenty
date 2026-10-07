import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-job-retry-options.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-recheck-minimum-delay-ms.constant';
import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';
import { type EndAgentChatThreadSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job.types';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadWriteStep } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-write-step.type';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';
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

type BuildParticipantWriteQuery = (tables: {
  participantTable: string;
  threadTable: string;
}) => string;

// A member reading or filing a channel chat they do not follow gets a row
// without following it; any other chat is theirs to follow
const IS_SUBSCRIBED_BY_DEFAULT = 'thread."channelId" IS NULL';

// A snooze whose end is already due, which its queued end may have checked
// before this write, is saved as ended. A snoozed thread is meant to come
// back, so snoozing follows it again
const buildArchiveQuery: BuildParticipantWriteQuery = ({
  participantTable,
  threadTable,
}) =>
  `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "archivedAt", "snoozedUntil", "isSubscribed")
   SELECT thread.id, $2, CASE WHEN $3::timestamptz <= clock_timestamp() THEN NULL ELSE clock_timestamp() END, $3,
     $3::timestamptz IS NOT NULL OR ${IS_SUBSCRIBED_BY_DEFAULT}
   FROM ${threadTable} thread WHERE thread.id = $1
   ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
     "archivedAt" = EXCLUDED."archivedAt",
     "snoozedUntil" = EXCLUDED."snoozedUntil",
     "isSubscribed" = participant."isSubscribed" OR EXCLUDED."snoozedUntil" IS NOT NULL,
     "updatedAt" = now()
   RETURNING *`;

const PARTICIPANT_COLUMNS = `id, "workspaceMemberId", "threadId", "lastReadAt", "archivedAt", "snoozedUntil", "isSubscribed", "lastMentionedAt", "updatedAt"`;

// Timestamps compared against thread.lastActivityAt are stamped by Postgres
// (clock_timestamp), so ordering follows the database rather than app servers.
// Every row is granted to its member, and every change to it is sent as a
// record event, which only that member is let through to receive.
@Injectable()
export class AgentChatThreadParticipantService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly participantEventService: AgentChatThreadParticipantEventService,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly delayedJobsQueueService: MessageQueueService,
  ) {}

  async markAsRead(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    // Read up to what the thread holds now, never past it, and never back
    return this.upsertOne(
      args,
      ({ participantTable, threadTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt", "isSubscribed")
         SELECT thread.id, $2, thread."lastActivityAt", ${IS_SUBSCRIBED_BY_DEFAULT}
         FROM ${threadTable} thread WHERE thread.id = $1
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
           "updatedAt" = now()
         RETURNING *`,
    );
  }

  async markAsUnread(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(
      args,
      ({ participantTable, threadTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt", "isSubscribed")
         SELECT thread.id, $2, NULL, ${IS_SUBSCRIBED_BY_DEFAULT}
         FROM ${threadTable} thread WHERE thread.id = $1
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = NULL,
           "updatedAt" = now()
         RETURNING *`,
    );
  }

  // A mention brings the chat back unread for the mentioned member, who the
  // caller has already checked can reply in it, and follows it again for a
  // member who had unsubscribed
  async markAsMentioned(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadParticipantRow | null> {
    return this.writeOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastMentionedAt")
         VALUES ($1, $2, clock_timestamp())
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = NULL,
           "archivedAt" = NULL,
           "snoozedUntil" = NULL,
           "isSubscribed" = true,
           "lastMentionedAt" = EXCLUDED."lastMentionedAt",
           "updatedAt" = now()
         RETURNING *`,
    );
  }

  // An assignee follows the chat and finds it in their inbox, unread unless
  // they assigned it to themselves
  // The assignment is written by writeAssignment in the same transaction, so
  // it is never saved without the assignee following the chat
  async markAsAssigned({
    isSelfAssigned,
    writeAssignment,
    ...args
  }: AgentChatThreadAccessArgs & {
    isSelfAssigned: boolean;
    writeAssignment: AgentChatThreadWriteStep;
  }): Promise<AgentChatThreadParticipantRow | null> {
    return this.writeOne(
      args,
      ({ participantTable, threadTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
         SELECT thread.id, $2, CASE WHEN $3::boolean THEN thread."lastActivityAt" END
         FROM ${threadTable} thread WHERE thread.id = $1
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "lastReadAt" = CASE WHEN $3::boolean THEN participant."lastReadAt" END,
           "archivedAt" = NULL,
           "snoozedUntil" = NULL,
           "isSubscribed" = true,
           "updatedAt" = now()
         RETURNING *`,
      [isSelfAssigned],
      writeAssignment,
    );
  }

  async subscribe(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
         VALUES ($1, $2)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "isSubscribed" = true,
           "updatedAt" = now()
         RETURNING *`,
    );
  }

  // Files the chat under done and keeps it there whatever happens in it,
  // until the member is mentioned or writes in it again
  // The assignee is checked under the thread's lock, which an assignment
  // takes too, so the member cannot be assigned while unsubscribing
  async unsubscribe(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadParticipantDTO> {
    const assertIsNotAssignee: AgentChatThreadWriteStep = async ({
      manager,
      table,
    }) => {
      const [thread] = await manager.query<{ assigneeId: string | null }[]>(
        `SELECT "assigneeId" FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
        [args.threadId],
      );

      if (thread?.assigneeId === args.workspaceMemberId) {
        throw new AiException(
          'The assignee of a chat cannot unsubscribe from it',
          AiExceptionCode.CHAT_THREAD_ASSIGNEE_CANNOT_UNSUBSCRIBE,
        );
      }
    };

    return this.upsertOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "isSubscribed", "archivedAt")
         VALUES ($1, $2, false, clock_timestamp())
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "isSubscribed" = false,
           "archivedAt" = EXCLUDED."archivedAt",
           "snoozedUntil" = NULL,
           "updatedAt" = now()
         RETURNING *`,
      [],
      assertIsNotAssignee,
    );
  }

  archive({
    writeThread,
    ...args
  }: AgentChatThreadAccessArgs & {
    writeThread?: AgentChatThreadWriteStep;
  }): Promise<AgentChatThreadParticipantDTO> {
    return this.setArchive(args, null, writeThread);
  }

  async snooze({
    snoozedUntil,
    writeThread,
    ...args
  }: AgentChatThreadAccessArgs & {
    snoozedUntil: Date;
    writeThread?: AgentChatThreadWriteStep;
  }): Promise<AgentChatThreadParticipantDTO> {
    if (snoozedUntil.getTime() <= Date.now()) {
      throw new AiException(
        'Snooze time must be in the future',
        AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
      );
    }

    await this.assertCanWriteInboxState(args);

    // Queued before the write, so no saved snooze lacks its end; the end of
    // a snooze that was never saved finds nothing to end
    await this.scheduleSnoozeEnd({
      ...args,
      snoozedUntil: snoozedUntil.toISOString(),
      delay: Math.max(snoozedUntil.getTime() - Date.now(), 0),
    });

    return this.setArchive(args, snoozedUntil, writeThread);
  }

  // A snooze ends by moving the chat back to the inbox. The snooze stays
  // recorded, as what brought it back.
  async endSnooze({
    snoozedUntil,
    ...args
  }: EndAgentChatThreadSnoozeJobData): Promise<void> {
    const remainingDelay = await this.findRemainingSnoozeDelay({
      workspaceId: args.workspaceId,
      snoozedUntil,
    });

    // This server's clock ran ahead of the database's
    if (remainingDelay > 0) {
      await this.scheduleSnoozeEnd({
        ...args,
        snoozedUntil,
        delay: Math.max(
          remainingDelay,
          AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS,
        ),
      });

      return;
    }

    const [readableThreadId] = await this.sharingService.findReadableThreadIds({
      workspaceId: args.workspaceId,
      workspaceMemberId: args.workspaceMemberId,
      threadIds: [args.threadId],
    });

    if (!isDefined(readableThreadId)) {
      return;
    }

    // A snooze the member replaced or cleared since has nothing to end
    await this.writeOne(
      args,
      ({ participantTable }) =>
        `UPDATE ${participantTable}
         SET "archivedAt" = NULL, "updatedAt" = now()
         WHERE "threadId" = $1 AND "workspaceMemberId" = $2
           AND "snoozedUntil" = $3 AND "archivedAt" IS NOT NULL
         RETURNING *`,
      [snoozedUntil],
    );
  }

  async isFollowing(args: AgentChatThreadAccessArgs): Promise<boolean> {
    if (!(await this.sharingService.hasInboxState(args.workspaceId))) {
      return false;
    }

    const participant = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) => this.findOne({ manager, ...args }),
    );

    return participant?.isSubscribed ?? false;
  }

  // For the row written along with a new thread
  async emitParticipantCreated(args: AgentChatThreadAccessArgs): Promise<void> {
    if (!(await this.sharingService.hasInboxState(args.workspaceId))) {
      return;
    }

    const participant = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) => this.findOne({ manager, ...args }),
    );

    if (!isDefined(participant)) {
      return;
    }

    await this.participantEventService.emitParticipantWritten({
      workspaceId: args.workspaceId,
      before: null,
      after: participant,
    });
  }

  async moveToInbox({
    writeThread,
    ...args
  }: AgentChatThreadAccessArgs & {
    writeThread?: AgentChatThreadWriteStep;
  }): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(
      args,
      ({ participantTable }) =>
        `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
         VALUES ($1, $2)
         ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
           "archivedAt" = NULL,
           "snoozedUntil" = NULL,
           "isSubscribed" = true,
           "updatedAt" = now()
         RETURNING *`,
      [],
      writeThread,
    );
  }

  // A member who writes in a thread has read it and follows it again, so
  // their cursor follows the activity they just created
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
    const participantObjectMetadataId =
      await this.sharingService.findParticipantObjectMetadataId(workspaceId);

    const { rows, before, after } = await this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const before = await this.findOne({
          manager,
          workspaceId,
          workspaceMemberId,
          threadId,
          lock: true,
        });

        const rows = await manager.query<AgentChatThreadActivity[]>(
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
               "isSubscribed" = true,
               "updatedAt" = now()
             RETURNING id, "workspaceMemberId"
           ), owner_share AS (
             ${buildAgentChatThreadParticipantOwnerShareInsert({ workspaceId, participantSource: 'participant', objectMetadataIdParameter: '$4' })}
           )
           SELECT ${AGENT_CHAT_THREAD_ACTIVITY_COLUMNS} FROM thread`,
          [threadId, workspaceMemberId, text, participantObjectMetadataId],
        );

        const after = await this.findOne({
          manager,
          workspaceId,
          workspaceMemberId,
          threadId,
        });

        return { rows, before, after };
      },
    );

    if (rows.length !== 1) {
      return throwAgentChatThreadNotFound();
    }

    if (isDefined(after)) {
      await this.participantEventService.emitParticipantWritten({
        workspaceId,
        before,
        after,
      });
    }

    return rows[0];
  }

  private async scheduleSnoozeEnd({
    delay,
    ...data
  }: EndAgentChatThreadSnoozeJobData & { delay: number }): Promise<void> {
    await this.delayedJobsQueueService.add<EndAgentChatThreadSnoozeJobData>(
      END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME,
      data,
      { delay, ...AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS },
    );
  }

  private async findOne({
    manager,
    workspaceId,
    workspaceMemberId,
    threadId,
    lock = false,
  }: AgentChatThreadAccessArgs & {
    manager: EntityManager;
    lock?: boolean;
  }): Promise<AgentChatThreadParticipantRow | null> {
    // Also taken when the row does not exist yet, so two first writes cannot
    // both send it as created
    if (lock) {
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [
          `agent-chat-thread-participant:${workspaceId}:${threadId}:${workspaceMemberId}`,
        ],
      );
    }

    const [participant] = await manager.query<AgentChatThreadParticipantRow[]>(
      `SELECT ${PARTICIPANT_COLUMNS}
       FROM ${getAgentChatThreadParticipantTable(workspaceId)}
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [threadId, workspaceMemberId],
    );

    return participant ?? null;
  }

  private async findRemainingSnoozeDelay({
    workspaceId,
    snoozedUntil,
  }: {
    workspaceId: string;
    snoozedUntil: string;
  }): Promise<number> {
    const [{ remainingDelay }] = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<{ remainingDelay: number }[]>(
          `SELECT GREATEST(CEIL(EXTRACT(EPOCH FROM $1::timestamptz - clock_timestamp()) * 1000), 0)::int AS "remainingDelay"`,
          [snoozedUntil],
        ),
    );

    return remainingDelay;
  }

  private setArchive(
    args: AgentChatThreadAccessArgs,
    snoozedUntil: Date | null,
    writeThread?: AgentChatThreadWriteStep,
  ): Promise<AgentChatThreadParticipantDTO> {
    return this.upsertOne(args, buildArchiveQuery, [snoozedUntil], writeThread);
  }

  private async upsertOne(
    args: AgentChatThreadAccessArgs,
    buildQuery: BuildParticipantWriteQuery,
    extraParameters: unknown[] = [],
    writeThread?: AgentChatThreadWriteStep,
  ): Promise<AgentChatThreadParticipantDTO> {
    await this.assertCanWriteInboxState(args);

    return this.writeOneOrThrow(args, buildQuery, extraParameters, writeThread);
  }

  private async assertCanWriteInboxState({
    workspaceId,
    workspaceMemberId,
    threadId,
  }: AgentChatThreadAccessArgs): Promise<void> {
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
  }

  private async writeOneOrThrow(
    args: AgentChatThreadAccessArgs,
    buildQuery: BuildParticipantWriteQuery,
    extraParameters: unknown[],
    writeThread?: AgentChatThreadWriteStep,
  ): Promise<AgentChatThreadParticipantDTO> {
    return (
      (await this.writeOne(args, buildQuery, extraParameters, writeThread)) ??
      throwAgentChatThreadNotFound()
    );
  }

  // The row is locked while it is read and written, so the change sent is
  // the one this write made
  private async writeOne(
    { workspaceId, workspaceMemberId, threadId }: AgentChatThreadAccessArgs,
    buildQuery: BuildParticipantWriteQuery,
    extraParameters: unknown[] = [],
    writeThread?: AgentChatThreadWriteStep,
  ): Promise<AgentChatThreadParticipantRow | null> {
    const parameters = [
      threadId,
      workspaceMemberId,
      ...extraParameters,
      await this.sharingService.findParticipantObjectMetadataId(workspaceId),
    ];

    const { before, after } = await this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const before = await this.findOne({
          manager,
          workspaceId,
          workspaceMemberId,
          threadId,
          lock: true,
        });

        await writeThread?.({ manager, table });

        const [after] = await manager.query<AgentChatThreadParticipantRow[]>(
          `WITH written_participant AS (
             ${buildQuery({
               participantTable:
                 getAgentChatThreadParticipantTable(workspaceId),
               threadTable: table('agentChatThread'),
             })}
           ), owner_share AS (
             ${buildAgentChatThreadParticipantOwnerShareInsert({
               workspaceId,
               participantSource: 'written_participant',
               objectMetadataIdParameter: `$${parameters.length}`,
             })}
           )
           SELECT ${PARTICIPANT_COLUMNS} FROM written_participant`,
          parameters,
        );

        return { before, after };
      },
    );

    if (!isDefined(after)) {
      return null;
    }

    await this.participantEventService.emitParticipantWritten({
      workspaceId,
      before,
      after,
    });

    return after;
  }
}
