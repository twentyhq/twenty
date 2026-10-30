import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager, In } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_INBOX_ACTION_QUERIES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-inbox-action-queries.constant';
import { AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-column-names.constant';
import { AGENT_CHAT_THREAD_PARTICIPANT_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-columns.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-job-retry-options.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-recheck-minimum-delay-ms.constant';
import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';
import { type EndAgentChatThreadSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job.types';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadWriteStep } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-write-step.type';
import { type BuildAgentChatThreadParticipantWriteQuery } from 'src/engine/metadata-modules/ai/ai-chat/types/build-agent-chat-thread-participant-write-query.type';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadParticipantWrite } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-write.type';
import { type AgentChatThreadActivity } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-activity.type';
import { buildAgentChatThreadAssigneeParticipantQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-assignee-participant-query.util';
import { buildAgentChatThreadMentionResolutionQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-mention-resolution-query.util';
import { buildAgentChatThreadMemberActivityQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-member-activity-query.util';
import { buildAgentChatThreadMoveMembersToInboxQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-move-members-to-inbox-query.util';
import { buildAgentChatThreadParticipantLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-lock-key.util';
import { buildAgentChatThreadParticipantWriteWithOwnerShareQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-write-with-owner-share-query.util';
import { buildAgentChatThreadSnoozeEndQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-snooze-end-query.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { findAgentChatSnoozeRemainingDelay } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-snooze-remaining-delay.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const PARTICIPANT_LOCK_QUERY =
  'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))';

const PARTICIPANTS_LOCK_QUERY = `SELECT pg_advisory_xact_lock(hashtextextended(lock_key, 0))
   FROM unnest($1::text[]) lock_key ORDER BY lock_key`;

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
    writeThread,
    workspaceId,
    workspaceMemberId,
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
    threadIds: string[];
    action: AgentChatInboxAction;
    snoozedUntil: Date | null;
    writeThread?: AgentChatThreadWriteStep;
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
    const assertIsNotAssignee: AgentChatThreadWriteStep = async ({
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
      AGENT_CHAT_INBOX_ACTION_QUERIES[action],
      isSnooze ? [snoozeEnd] : [],
      action === AgentChatInboxAction.UNSUBSCRIBE
        ? assertIsNotAssignee
        : writeThread,
    );
  }

  async moveMembersToInbox({
    participantWorkspaceMemberIds,
    isMention,
    ...args
  }: AgentChatThreadAccessArgs & {
    participantWorkspaceMemberIds: string[];
    isMention: boolean;
  }): Promise<void> {
    const memberIds = [...new Set(participantWorkspaceMemberIds)].filter(
      (memberId) => memberId !== args.workspaceMemberId,
    );

    if (!isNonEmptyArray(memberIds)) {
      return;
    }

    await this.assertCanMoveMembersToInbox({ ...args, memberIds });

    const { workspaceId, threadId } = args;
    const objectMetadataId =
      await this.sharingService.getParticipantObjectMetadataId(workspaceId);
    const writes = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction((scope) =>
          this.writeMembersToInbox({
            scope,
            workspaceId,
            threadId,
            memberIds,
            isMention,
            objectMetadataId,
          }),
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );

    await this.emitParticipantWrites({ workspaceId, writes });
  }

  async resolveMention({
    writeResponse,
    ...args
  }: AgentChatThreadAccessArgs & {
    writeResponse: AgentChatThreadWriteStep;
  }): Promise<void> {
    await this.write(
      { ...args, threadIds: [args.threadId] },
      buildAgentChatThreadMentionResolutionQuery,
      [],
      writeResponse,
    );
  }

  async resolveMentionInTransaction({
    scope,
    ...args
  }: AgentChatThreadAccessArgs & {
    scope: Pick<AgentHistoryTransactionScope, 'executeRawQuery'>;
  }): Promise<void> {
    await this.sharingService.assertHasMentionResolutionOrThrow(
      args.workspaceId,
    );
    // Taken by the writes on the other pool too, so before and after stay this write's
    await scope.executeRawQuery(PARTICIPANT_LOCK_QUERY, [
      buildAgentChatThreadParticipantLockKey(args),
    ]);
    await scope.executeRawQuery(
      buildAgentChatThreadMentionResolutionQuery({
        participantTable: getAgentChatThreadParticipantTable(args.workspaceId),
      }),
      [args.threadId, args.workspaceMemberId],
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
    writeAssignment: AgentChatThreadWriteStep;
  }): Promise<void> {
    await this.write(
      { ...args, threadIds: [threadId] },
      buildAgentChatThreadAssigneeParticipantQuery,
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
    const remainingDelay = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) =>
        findAgentChatSnoozeRemainingDelay({ manager, snoozedUntil }),
    );

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
      buildAgentChatThreadSnoozeEndQuery,
      [snoozedUntil],
    );
  }

  async isFollowing(args: AgentChatThreadAccessArgs): Promise<boolean> {
    await this.sharingService.assertHasMentionResolutionOrThrow(
      args.workspaceId,
    );

    const participant = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) => this.findOne({ manager, ...args }),
    );

    return participant?.isSubscribed ?? false;
  }

  // For the row written along with a new thread
  async emitParticipantCreated(args: AgentChatThreadAccessArgs): Promise<void> {
    await this.sharingService.assertHasMentionResolutionOrThrow(
      args.workspaceId,
    );

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
    const participantObjectMetadataId =
      await this.sharingService.getParticipantObjectMetadataId(workspaceId);

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
          buildAgentChatThreadMemberActivityQuery({
            workspaceId,
            threadTable: table('agentChatThread'),
          }),
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

  async countMembers({
    workspaceId,
    threadId,
    additionalWorkspaceMemberIds,
  }: {
    workspaceId: string;
    threadId: string;
    additionalWorkspaceMemberIds: string[];
  }): Promise<number> {
    const [{ memberCount }] = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<{ memberCount: number }[]>(
          `SELECT COUNT(DISTINCT member)::int AS "memberCount" FROM (
             SELECT "workspaceMemberId" AS member
             FROM ${getAgentChatThreadParticipantTable(workspaceId)}
             WHERE "threadId" = $1
             UNION SELECT unnest($2::uuid[])
           ) members`,
          [threadId, additionalWorkspaceMemberIds],
        ),
    );

    return memberCount;
  }

  private async scheduleSnoozeEnd({
    delay,
    ...data
  }: EndAgentChatThreadSnoozeJobData & { delay: number }): Promise<void> {
    await this.delayedJobsQueueService.add<EndAgentChatThreadSnoozeJobData>(
      END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME,
      data,
      {
        delay,
        ...AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS,
        workspaceId: data.workspaceId,
        isWorkspaceJob: true,
      },
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
      await manager.query(PARTICIPANT_LOCK_QUERY, [
        buildAgentChatThreadParticipantLockKey({
          workspaceId,
          threadId,
          workspaceMemberId,
        }),
      ]);
    }

    const [participant] = await manager.query<AgentChatThreadParticipantRow[]>(
      `SELECT ${AGENT_CHAT_THREAD_PARTICIPANT_COLUMNS}
       FROM ${getAgentChatThreadParticipantTable(workspaceId)}
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [threadId, workspaceMemberId],
    );

    return participant ?? null;
  }

  private async lockParticipants({
    scope,
    workspaceId,
    threadId,
    memberIds,
  }: Pick<AgentChatThreadAccessArgs, 'workspaceId' | 'threadId'> & {
    scope: WorkspaceTransactionScope;
    memberIds: string[];
  }): Promise<void> {
    await scope.executeRawQuery(PARTICIPANTS_LOCK_QUERY, [
      memberIds.map((workspaceMemberId) =>
        buildAgentChatThreadParticipantLockKey({
          workspaceId,
          threadId,
          workspaceMemberId,
        }),
      ),
    ]);
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
  }

  private async assertCanMoveMembersToInbox({
    memberIds,
    ...args
  }: AgentChatThreadAccessArgs & { memberIds: string[] }): Promise<void> {
    await this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });

    const eligibleMemberIds =
      await this.sharingService.findEligibleParticipantWorkspaceMemberIds({
        ...args,
        memberIds,
        shouldConsiderNewShares: false,
      });

    if (eligibleMemberIds.length !== memberIds.length) {
      throwAgentChatThreadNotFound();
    }
  }

  private async writeMembersToInbox({
    scope,
    workspaceId,
    threadId,
    memberIds,
    isMention,
    objectMetadataId,
  }: Pick<AgentChatThreadAccessArgs, 'workspaceId' | 'threadId'> & {
    scope: WorkspaceTransactionScope;
    memberIds: string[];
    isMention: boolean;
    objectMetadataId: string;
  }): Promise<AgentChatThreadParticipantWrite[]> {
    await this.lockParticipants({ scope, workspaceId, threadId, memberIds });

    const participantsBefore = await scope
      .getRepository('agentChatThreadParticipant', {
        shouldBypassPermissionChecks: true,
      })
      .createQueryBuilder()
      .select(AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES)
      .where({ threadId, workspaceMemberId: In(memberIds) })
      .withDeleted()
      .getMany<AgentChatThreadParticipantRow>({ noFormatting: true });
    const participantsAfter = (await scope.executeRawQuery(
      buildAgentChatThreadMoveMembersToInboxQuery({ workspaceId }),
      [threadId, memberIds, objectMetadataId, isMention],
    )) as unknown as AgentChatThreadParticipantRow[];
    const participantBeforeByMemberId = new Map(
      participantsBefore.map((participant) => [
        participant.workspaceMemberId,
        participant,
      ]),
    );

    return participantsAfter.map((participantAfter) => ({
      before:
        participantBeforeByMemberId.get(participantAfter.workspaceMemberId) ??
        null,
      after: participantAfter,
    }));
  }

  private async emitParticipantWrites({
    workspaceId,
    writes,
  }: {
    workspaceId: string;
    writes: AgentChatThreadParticipantWrite[];
  }): Promise<void> {
    for (const write of writes) {
      await this.participantEventService.emitParticipantWritten({
        workspaceId,
        ...write,
      });
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
    buildQuery: BuildAgentChatThreadParticipantWriteQuery,
    extraParameters: unknown[] = [],
    writeThread?: AgentChatThreadWriteStep,
  ): Promise<AgentChatThreadParticipantRow[]> {
    const objectMetadataId =
      await this.sharingService.getParticipantObjectMetadataId(workspaceId);

    const writes = await this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const parameterCount = extraParameters.length + 3;
        const query = buildAgentChatThreadParticipantWriteWithOwnerShareQuery({
          workspaceId,
          participantWriteQuery: buildQuery({
            participantTable: getAgentChatThreadParticipantTable(workspaceId),
            threadTable: table('agentChatThread'),
          }),
          objectMetadataIdParameter: `$${parameterCount}`,
        });
        const writes: AgentChatThreadParticipantWrite[] = [];

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

    await this.emitParticipantWrites({ workspaceId, writes });

    return writes.map(({ after }) => after);
  }
}
