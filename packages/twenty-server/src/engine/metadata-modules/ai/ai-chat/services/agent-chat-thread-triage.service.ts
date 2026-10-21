import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-job-retry-options.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-recheck-minimum-delay-ms.constant';
import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job-name.constant';
import { type EndAgentChatChannelSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job.types';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadTriageChange } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-triage-change.type';
import { type AgentChatThreadWriteStep } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-write-step.type';
import { buildAgentChatThreadTriageChange } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-triage-change.util';
import { findAgentChatSnoozeRemainingDelay } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-snooze-remaining-delay.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// Channel actions write the shared copy, and the actor's if they follow.
// Personal actions write the actor's, and the shared one for the assignee.
@Injectable()
export class AgentChatThreadTriageService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly participantService: AgentChatThreadParticipantService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly delayedJobsQueueService: MessageQueueService,
  ) {}

  async updateInboxState({
    threadIds,
    action,
    snoozedUntil,
    ...memberArgs
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
    threadIds: string[];
    action: AgentChatInboxAction;
    snoozedUntil: Date | null;
  }): Promise<AgentChatThreadParticipantDTO[]> {
    const change = buildAgentChatThreadTriageChange({ action, snoozedUntil });
    const assignedChannelThreads = isDefined(change)
      ? await this.findAssignedChannelThreads({ ...memberArgs, threadIds })
      : [];

    if (!isDefined(change) || assignedChannelThreads.length === 0) {
      return this.participantService.updateInboxState({
        ...memberArgs,
        threadIds,
        action,
        snoozedUntil,
      });
    }

    for (const thread of assignedChannelThreads) {
      await this.prepareChannelCopyWriteOrThrow({
        ...memberArgs,
        threadId: thread.id,
        change,
      });
    }

    const channelCopyWrite = this.buildChannelCopyWrite({
      change,
      workspaceMemberId: memberArgs.workspaceMemberId,
      threadIds: assignedChannelThreads.map(({ id }) => id),
      isAssigneeOnly: true,
    });

    const participants = await this.participantService.updateInboxState({
      ...memberArgs,
      threadIds,
      action,
      snoozedUntil,
      writeThread: channelCopyWrite.write,
    });

    await this.emitChannelCopiesUpdated({
      workspaceId: memberArgs.workspaceId,
      threadsBefore: assignedChannelThreads,
      threadsAfter: channelCopyWrite.threadsAfter,
    });

    return participants;
  }

  async applyToChannelCopy({
    change,
    ...args
  }: AgentChatThreadAccessArgs & {
    change: AgentChatThreadTriageChange;
  }): Promise<void> {
    const threadBefore = await this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });

    if (!isDefined(threadBefore.channelId)) {
      throw new AiException(
        'The chat is not in a channel',
        AiExceptionCode.CHAT_THREAD_NOT_IN_CHANNEL,
      );
    }

    await this.prepareChannelCopyWriteOrThrow({ ...args, change });

    const channelCopyWrite = this.buildChannelCopyWrite({
      change,
      workspaceMemberId: args.workspaceMemberId,
      threadIds: [args.threadId],
      isAssigneeOnly: false,
    });

    if (await this.participantService.isFollowing(args)) {
      await this.participantService.updateInboxState({
        workspaceId: args.workspaceId,
        workspaceMemberId: args.workspaceMemberId,
        threadIds: [args.threadId],
        action: change.action,
        snoozedUntil:
          change.action === AgentChatInboxAction.SNOOZE
            ? change.snoozedUntil
            : null,
        writeThread: channelCopyWrite.write,
      });
    } else {
      await this.threadRepository.query(args.workspaceId, (context) =>
        channelCopyWrite.write({ ...context, threadId: args.threadId }),
      );
    }

    await this.emitChannelCopiesUpdated({
      workspaceId: args.workspaceId,
      threadsBefore: [threadBefore],
      threadsAfter: channelCopyWrite.threadsAfter,
    });
  }

  // Keeps channelSnoozedUntil: it records what brought the chat back
  async endChannelSnooze({
    workspaceId,
    threadId,
    snoozedUntil,
  }: EndAgentChatChannelSnoozeJobData): Promise<void> {
    const remainingDelay = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        findAgentChatSnoozeRemainingDelay({ manager, snoozedUntil }),
    );

    // This server's clock ran ahead of the database's
    if (remainingDelay > 0) {
      await this.scheduleChannelSnoozeEnd({
        workspaceId,
        threadId,
        snoozedUntil,
        delay: Math.max(
          remainingDelay,
          AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS,
        ),
      });

      return;
    }

    const threadBefore = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!isDefined(threadBefore)) {
      return;
    }

    // A snooze the channel replaced or cleared since has nothing to end
    const endedThreadIds = await this.threadRepository.query(
      workspaceId,
      ({ manager, table }) =>
        manager.query<{ id: string }[]>(
          `WITH ended_thread AS (
             UPDATE ${table('agentChatThread')}
             SET "channelArchivedAt" = NULL, "updatedAt" = now()
             WHERE id = $1 AND "channelSnoozedUntil" = $2
               AND "channelArchivedAt" IS NOT NULL
             RETURNING id
           )
           SELECT id FROM ended_thread`,
          [threadId, snoozedUntil],
        ),
    );

    if (endedThreadIds.length === 0) {
      return;
    }

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore,
    });
  }

  // Queued before the write, so no saved snooze lacks its end; the end of a
  // snooze that was never saved finds nothing to end
  private async findAssignedChannelThreads({
    threadIds,
    workspaceId,
    workspaceMemberId,
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
    threadIds: string[];
  }): Promise<AgentChatThreadWorkspaceEntity[]> {
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      return [];
    }

    return this.threadRepository.find(workspaceId, {
      where: {
        id: In(threadIds),
        assigneeId: workspaceMemberId,
        channelId: Not(IsNull()),
      },
    });
  }

  private async prepareChannelCopyWriteOrThrow({
    change,
    ...args
  }: AgentChatThreadAccessArgs & {
    change: AgentChatThreadTriageChange;
  }): Promise<void> {
    if (change.action !== AgentChatInboxAction.SNOOZE) {
      return;
    }

    if (change.snoozedUntil.getTime() <= Date.now()) {
      throw new AiException(
        'Snooze time must be in the future',
        AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
      );
    }

    await this.scheduleChannelSnoozeEnd({
      workspaceId: args.workspaceId,
      threadId: args.threadId,
      snoozedUntil: change.snoozedUntil.toISOString(),
      delay: Math.max(change.snoozedUntil.getTime() - Date.now(), 0),
    });
  }

  // Stamped by Postgres like a member's copy, and in its transaction when both
  // change, so the two copies share one clock and never disagree
  private buildChannelCopyWrite({
    change,
    workspaceMemberId,
    threadIds,
    isAssigneeOnly,
  }: {
    change: AgentChatThreadTriageChange;
    workspaceMemberId: string;
    threadIds: string[];
    isAssigneeOnly: boolean;
  }): {
    write: AgentChatThreadWriteStep;
    threadsAfter: Map<string, AgentChatThreadWorkspaceEntity>;
  } {
    const channelThreadIds = new Set(threadIds);
    const threadsAfter = new Map<string, AgentChatThreadWorkspaceEntity>();

    const write: AgentChatThreadWriteStep = async ({
      manager,
      table,
      threadId,
    }) => {
      if (!channelThreadIds.has(threadId)) {
        return;
      }

      const [threadAfter] = await manager.query<
        AgentChatThreadWorkspaceEntity[]
      >(
        `WITH filed_thread AS (
           UPDATE ${table('agentChatThread')}
           SET "channelArchivedAt" = CASE
               WHEN NOT $2::boolean THEN NULL
               WHEN $3::timestamptz <= clock_timestamp() THEN NULL
               ELSE clock_timestamp()
             END,
             "channelSnoozedUntil" = $3,
             "updatedAt" = now()
           WHERE id = $1 AND "channelId" IS NOT NULL
             AND (NOT $5::boolean OR "assigneeId" = $4::uuid)
           RETURNING *
         )
         SELECT * FROM filed_thread`,
        [
          threadId,
          change.action !== AgentChatInboxAction.MOVE_TO_INBOX,
          change.action === AgentChatInboxAction.SNOOZE
            ? change.snoozedUntil
            : null,
          workspaceMemberId,
          isAssigneeOnly,
        ],
      );

      if (isDefined(threadAfter)) {
        threadsAfter.set(threadId, threadAfter);
      }
    };

    return { write, threadsAfter };
  }

  private async emitChannelCopiesUpdated({
    workspaceId,
    threadsBefore,
    threadsAfter,
  }: {
    workspaceId: string;
    threadsBefore: AgentChatThreadWorkspaceEntity[];
    threadsAfter: Map<string, AgentChatThreadWorkspaceEntity>;
  }): Promise<void> {
    await this.threadRecordEventService.emitThreadsUpdated({
      workspaceId,
      threads: threadsBefore.flatMap((before) => {
        const after = threadsAfter.get(before.id);

        return isDefined(after) ? [{ before, after }] : [];
      }),
    });
  }

  private async scheduleChannelSnoozeEnd({
    delay,
    ...data
  }: EndAgentChatChannelSnoozeJobData & { delay: number }): Promise<void> {
    await this.delayedJobsQueueService.add<EndAgentChatChannelSnoozeJobData>(
      END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME,
      data,
      { delay, ...AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS },
    );
  }
}
