import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_THREAD_ACTIVITY_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-activity-columns.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-job-retry-options.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-recheck-minimum-delay-ms.constant';
import { type AgentChatOpenThreadsSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-open-threads-summary.dto';
import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';
import { type EndAgentChatThreadSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job.types';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';
import { buildAgentChatThreadActivitySetClause } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-activity-set-clause.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { touchAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/touch-agent-chat-thread.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

// Runs in the participant write's transaction, after the participant row is
// locked, in the order member activity takes the two locks
type WriteThreadStep = (
  context: AgentHistoryStorageContext & { threadId: string },
) => Promise<void>;

type BuildParticipantWriteQuery = (tables: {
  participantTable: string;
  threadTable: string;
}) => string;

// A snooze whose end is already due, which its queued end may have checked
// before this write, is saved as ended. A snoozed thread is meant to come
// back, so snoozing follows it again
const buildArchiveQuery: BuildParticipantWriteQuery = ({ participantTable }) =>
  `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "archivedAt", "snoozedUntil")
   VALUES ($1, $2, CASE WHEN $3::timestamptz <= clock_timestamp() THEN NULL ELSE clock_timestamp() END, $3)
   ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
     "archivedAt" = EXCLUDED."archivedAt",
     "snoozedUntil" = EXCLUDED."snoozedUntil",
     "isSubscribed" = participant."isSubscribed" OR EXCLUDED."snoozedUntil" IS NOT NULL,
     "updatedAt" = now()
   RETURNING *`;

// The member's change for each action, written by the database so its
// timestamps order against thread activity; applyAgentChatInboxAction makes
// the same change for the copy apps show before the server answers
const INBOX_ACTION_QUERIES: Record<
  AgentChatInboxAction,
  BuildParticipantWriteQuery
> = {
  // Read up to what the thread holds now, never past it, and never back
  [AgentChatInboxAction.READ]: ({ participantTable, threadTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, $2, thread."lastActivityAt" FROM ${threadTable} thread WHERE thread.id = $1
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
       "updatedAt" = now()
     RETURNING *`,
  [AgentChatInboxAction.UNREAD]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt")
     VALUES ($1, $2, NULL)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = NULL,
       "updatedAt" = now()
     RETURNING *`,
  [AgentChatInboxAction.ARCHIVE]: buildArchiveQuery,
  [AgentChatInboxAction.SNOOZE]: buildArchiveQuery,
  [AgentChatInboxAction.MOVE_TO_INBOX]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
     VALUES ($1, $2)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "archivedAt" = NULL,
       "snoozedUntil" = NULL,
       "isSubscribed" = true,
       "updatedAt" = now()
     RETURNING *`,
  [AgentChatInboxAction.SUBSCRIBE]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
     VALUES ($1, $2)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "isSubscribed" = true,
       "updatedAt" = now()
     RETURNING *`,
  // Files the chat under done and keeps it there whatever happens in it,
  // until the member is mentioned or writes in it again
  [AgentChatInboxAction.UNSUBSCRIBE]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "isSubscribed", "archivedAt")
     VALUES ($1, $2, false, clock_timestamp())
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "isSubscribed" = false,
       "archivedAt" = EXCLUDED."archivedAt",
       "snoozedUntil" = NULL,
       "updatedAt" = now()
     RETURNING *`,
};

const EMPTY_OPEN_THREADS_SUMMARY: AgentChatOpenThreadsSummaryDTO = {
  openThreadCount: 0,
  needsInputThreadCount: 0,
  hasUnreadOpenThread: false,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async updateInboxState({
    threadIds,
    action,
    snoozedUntil,
    workspaceId,
    workspaceMemberId,
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
    threadIds: string[];
    action: AgentChatInboxAction;
    snoozedUntil: Date | null;
  }): Promise<AgentChatThreadParticipantDTO[]> {
    const isSnooze = action === AgentChatInboxAction.SNOOZE;
    const snoozeEnd = isSnooze ? snoozedUntil : null;

    // Sorted so two writes of the same member lock their rows in one order
    const uniqueThreadIds = [...new Set(threadIds)].sort();
    const memberArgs = { workspaceId, workspaceMemberId };

    await this.assertCanWriteInboxState({
      ...memberArgs,
      threadIds: uniqueThreadIds,
    });

    // Queued before the write, so no saved snooze lacks its end; the end of
    // a snooze that was never saved finds nothing to end
    if (isDefined(snoozeEnd)) {
      for (const threadId of uniqueThreadIds) {
        await this.scheduleSnoozeEnd({
          ...memberArgs,
          threadId,
          snoozedUntil: snoozeEnd.toISOString(),
          delay: Math.max(snoozeEnd.getTime() - Date.now(), 0),
        });
      }
    }

    // The assignee is checked under the thread's lock, which an assignment
    // takes too, so the member cannot be assigned while unsubscribing
    const assertIsNotAssignee: WriteThreadStep = async ({
      manager,
      table,
      threadId,
    }) => {
      const [thread] = await manager.query<{ assigneeId: string | null }[]>(
        `SELECT "assigneeId" FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
        [threadId],
      );

      if (thread?.assigneeId === workspaceMemberId) {
        throw new AiException(
          'The assignee of a chat cannot unsubscribe from it',
          AiExceptionCode.CHAT_THREAD_ASSIGNEE_CANNOT_UNSUBSCRIBE,
        );
      }
    };

    return this.write(
      { ...memberArgs, threadIds: uniqueThreadIds, isEveryRowRequired: true },
      INBOX_ACTION_QUERIES[action],
      action === AgentChatInboxAction.ARCHIVE || isSnooze ? [snoozeEnd] : [],
      action === AgentChatInboxAction.UNSUBSCRIBE
        ? assertIsNotAssignee
        : undefined,
    );
  }

  // A mention brings the chat back unread for the mentioned member, who the
  // caller has already checked can reply in it, and follows it again for a
  // member who had unsubscribed
  async markAsMentioned({
    threadId,
    ...args
  }: AgentChatThreadAccessArgs): Promise<void> {
    await this.write(
      { ...args, threadIds: [threadId] },
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
    threadId,
    ...args
  }: AgentChatThreadAccessArgs & {
    isSelfAssigned: boolean;
    writeAssignment: WriteThreadStep;
  }): Promise<void> {
    await this.write(
      { ...args, threadIds: [threadId] },
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
    await this.write(
      {
        workspaceId: args.workspaceId,
        workspaceMemberId: args.workspaceMemberId,
        threadIds: [args.threadId],
      },
      ({ participantTable }) =>
        `UPDATE ${participantTable}
         SET "archivedAt" = NULL, "updatedAt" = now()
         WHERE "threadId" = $1 AND "workspaceMemberId" = $2
           AND "snoozedUntil" = $3 AND "archivedAt" IS NOT NULL
         RETURNING *`,
      [snoozedUntil],
    );
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

  // Over every chat the member can open, the way the inbox lists them; a chat
  // without the member's row is in their inbox, unread
  async findOpenThreadsSummary({
    workspaceId,
    workspaceMemberId,
  }: Omit<
    AgentChatThreadAccessArgs,
    'threadId'
  >): Promise<AgentChatOpenThreadsSummaryDTO> {
    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });

    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return EMPTY_OPEN_THREADS_SUMMARY;
    }

    const [summary] = await this.workspaceOrmManager
      .executeInWorkspaceContext(() => {
        const repository =
          this.workspaceOrmManager.getRepositoryWithContextPermissions(
            'agentChatThread',
          );
        const readableThreads = repository
          .createQueryBuilder('thread')
          .select([])
          .addSelect('"thread"."id"', 'id')
          .addSelect('"thread"."lastActivityAt"', 'lastActivityAt')
          .addSelect('"thread"."assigneeId"', 'assigneeId')
          .addSelect(
            '"thread"."pendingQuestionMessageId"',
            'pendingQuestionMessageId',
          )
          .applyRowLevelPermissions();

        return repository.executeRaw<
          Pick<
            AgentChatOpenThreadsSummaryDTO,
            keyof AgentChatOpenThreadsSummaryDTO
          >
        >(
          `WITH open_thread AS (
             SELECT thread."assigneeId", thread."pendingQuestionMessageId", participant."lastMentionedAt",
               thread."lastActivityAt" IS NOT NULL
                 AND (participant."lastReadAt" IS NULL OR thread."lastActivityAt" > participant."lastReadAt") AS "isUnread"
             FROM (${readableThreads.getQuery()}) thread
             LEFT JOIN ${getAgentChatThreadParticipantTable(workspaceId)} participant
               ON participant."threadId" = thread.id AND participant."workspaceMemberId" = :summaryWorkspaceMemberId
             WHERE COALESCE(participant."isSubscribed", true)
               AND (participant."archivedAt" IS NULL OR thread."lastActivityAt" > participant."archivedAt")
           )
           SELECT
             COUNT(*)::int AS "openThreadCount",
             COUNT("pendingQuestionMessageId")::int AS "needsInputThreadCount",
             COALESCE(BOOL_OR("isUnread"), false) AS "hasUnreadOpenThread",
             COALESCE(BOOL_OR("isUnread" AND "lastMentionedAt" IS NOT NULL), false) AS "hasUnreadMentionThread",
             COALESCE(BOOL_OR("isUnread" AND "assigneeId" = :summaryWorkspaceMemberId), false) AS "hasUnreadAssignedThread"
           FROM open_thread`,
          {
            ...readableThreads.getParameters(),
            summaryWorkspaceMemberId: workspaceMemberId,
          },
        );
      }, authContext)
      .catch((error: unknown) => {
        // A role that cannot read chats has none open
        if (
          error instanceof PermissionsException &&
          error.code === PermissionsExceptionCode.PERMISSION_DENIED
        ) {
          return [EMPTY_OPEN_THREADS_SUMMARY];
        }

        throw error;
      });

    return summary;
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

  private async assertCanWriteInboxState({
    workspaceId,
    workspaceMemberId,
    threadIds,
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
    threadIds: string[];
  }): Promise<void> {
    const readableThreadIds = await this.sharingService.findReadableThreadIds({
      workspaceId,
      workspaceMemberId,
      threadIds,
    });

    if (readableThreadIds.length !== threadIds.length) {
      throwAgentChatThreadNotFound();
    }

    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      throw new AiException(
        'Chat inbox state is not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE,
      );
    }
  }

  // Each row is locked while it is read and written, so the change sent is
  // the one this write made; one transaction writes all of them or none
  private async write(
    {
      workspaceId,
      workspaceMemberId,
      threadIds,
      isEveryRowRequired = false,
    }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
      threadIds: string[];
      isEveryRowRequired?: boolean;
    },
    buildQuery: BuildParticipantWriteQuery,
    extraParameters: unknown[] = [],
    writeThread?: WriteThreadStep,
  ): Promise<AgentChatThreadParticipantRow[]> {
    const objectMetadataId =
      await this.sharingService.findParticipantObjectMetadataId(workspaceId);

    const writes = await this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const parameterCount = extraParameters.length + 3;
        const query = `WITH written_participant AS (
             ${buildQuery({
               participantTable:
                 getAgentChatThreadParticipantTable(workspaceId),
               threadTable: table('agentChatThread'),
             })}
           ), owner_share AS (
             ${buildAgentChatThreadParticipantOwnerShareInsert({
               workspaceId,
               participantSource: 'written_participant',
               objectMetadataIdParameter: `$${parameterCount}`,
             })}
           )
           SELECT ${PARTICIPANT_COLUMNS} FROM written_participant`;
        const writes: {
          before: AgentChatThreadParticipantRow | null;
          after: AgentChatThreadParticipantRow;
        }[] = [];

        for (const threadId of threadIds) {
          const before = await this.findOne({
            manager,
            workspaceId,
            workspaceMemberId,
            threadId,
            lock: true,
          });

          await writeThread?.({ manager, table, threadId });

          const [after] = await manager.query<AgentChatThreadParticipantRow[]>(
            query,
            [threadId, workspaceMemberId, ...extraParameters, objectMetadataId],
          );

          if (isDefined(after)) {
            writes.push({ before, after });
          } else if (isEveryRowRequired) {
            throwAgentChatThreadNotFound();
          }
        }

        return writes;
      },
    );

    for (const { before, after } of writes) {
      await this.participantEventService.emitParticipantWritten({
        workspaceId,
        before,
        after,
      });
    }

    return writes.map(({ after }) => after);
  }
}
