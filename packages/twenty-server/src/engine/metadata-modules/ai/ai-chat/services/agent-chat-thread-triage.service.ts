import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-job-retry-options.constant';
import { AGENT_CHAT_THREAD_SNOOZE_END_RECHECK_MINIMUM_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-snooze-end-recheck-minimum-delay-ms.constant';
import { type AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job-name.constant';
import { type EndAgentChatChannelSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job.types';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadTriageChange } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-triage-change.type';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// A chat in a channel has a shared copy, which the channel triages, and a
// copy for each member who follows it. As in Front, an action changes the
// copy of the view it is taken from: the channel view changes the shared
// copy and the actor's own copy if they follow the chat, a personal view
// changes the actor's copy, and the assignee acting anywhere also changes
// the shared copy. Other members' copies are never touched.
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

  async applyToMemberCopy({
    change,
    ...args
  }: AgentChatThreadAccessArgs & {
    change: AgentChatThreadTriageChange;
  }): Promise<AgentChatThreadParticipantDTO> {
    const participant = await this.writeMemberCopy({ ...args, change });

    const thread = await this.threadRepository.findOne(args.workspaceId, {
      where: { id: args.threadId },
      select: ['id', 'channelId', 'assigneeId'],
    });

    if (
      isDefined(thread?.channelId) &&
      thread.assigneeId === args.workspaceMemberId
    ) {
      await this.writeChannelCopy({ ...args, change });
    }

    return participant;
  }

  async applyToChannelCopy({
    change,
    ...args
  }: AgentChatThreadAccessArgs & {
    change: AgentChatThreadTriageChange;
  }): Promise<void> {
    const thread = await this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });

    if (!isDefined(thread.channelId)) {
      throw new AiException(
        'The chat is not in a channel',
        AiExceptionCode.CHAT_THREAD_NOT_IN_CHANNEL,
      );
    }

    await this.writeChannelCopy({ ...args, change });

    if (await this.participantService.isFollowing(args)) {
      await this.writeMemberCopy({ ...args, change });
    }
  }

  // A snooze ends by moving the chat back to its channel's open chats. The
  // snooze stays recorded, as what brought it back.
  async endChannelSnooze({
    workspaceId,
    threadId,
    snoozedUntil,
  }: EndAgentChatChannelSnoozeJobData): Promise<void> {
    const [{ remainingDelay }] = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<{ remainingDelay: number }[]>(
          `SELECT GREATEST(CEIL(EXTRACT(EPOCH FROM $1::timestamptz - clock_timestamp()) * 1000), 0)::int AS "remainingDelay"`,
          [snoozedUntil],
        ),
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

  private writeMemberCopy({
    change,
    ...args
  }: AgentChatThreadAccessArgs & {
    change: AgentChatThreadTriageChange;
  }): Promise<AgentChatThreadParticipantDTO> {
    switch (change.type) {
      case 'DONE':
        return this.participantService.archive(args);
      case 'SNOOZE':
        return this.participantService.snooze({
          ...args,
          snoozedUntil: change.snoozedUntil,
        });
      case 'REOPEN':
        return this.participantService.moveToInbox(args);
    }
  }

  // Timestamps are stamped by Postgres, as for a member's copy, so new
  // activity is compared against them on the same clock
  private async writeChannelCopy({
    change,
    ...args
  }: AgentChatThreadAccessArgs & {
    change: AgentChatThreadTriageChange;
  }): Promise<void> {
    const snoozedUntil = change.type === 'SNOOZE' ? change.snoozedUntil : null;

    if (isDefined(snoozedUntil)) {
      if (snoozedUntil.getTime() <= Date.now()) {
        throw new AiException(
          'Snooze time must be in the future',
          AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME,
        );
      }

      // Queued before the write, so no saved snooze lacks its end
      await this.scheduleChannelSnoozeEnd({
        workspaceId: args.workspaceId,
        threadId: args.threadId,
        snoozedUntil: snoozedUntil.toISOString(),
        delay: Math.max(snoozedUntil.getTime() - Date.now(), 0),
      });
    }

    const threadBefore = await this.threadRepository.findOne(args.workspaceId, {
      where: { id: args.threadId },
    });

    if (!isDefined(threadBefore?.channelId)) {
      return;
    }

    const isFiled = change.type !== 'REOPEN';

    await this.threadRepository.query(args.workspaceId, ({ manager, table }) =>
      manager.query(
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
           RETURNING id
         )
         SELECT id FROM filed_thread`,
        [args.threadId, isFiled, snoozedUntil],
      ),
    );

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId: args.workspaceId,
      threadBefore,
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
