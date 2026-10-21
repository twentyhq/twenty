import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

import { PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { AGENT_CHAT_WAITING_LINE_OWNER_TYPES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-line-owner-types.constant';
import { AGENT_CHAT_WAITING_LINE_RECHECK_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-line-recheck-delay-ms.constant';
import { type AgentChatWaitingRun } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-waiting-run.type';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const { RUN, QUEUED_MESSAGES } = AGENT_CHAT_WAITING_LINE_OWNER_TYPES;

// one waiter stands for every message queued in the conversation
const QUEUED_MESSAGES_WAITER_KEY = 'QUEUED_MESSAGES';

// the recheck reaps a holder whose worker died, which nothing else releases
const buildRecheckCondition = (): PendingWakeUpCondition => ({
  type: 'TIME',
  resumeAt: new Date(
    Date.now() + AGENT_CHAT_WAITING_LINE_RECHECK_DELAY_MS,
  ).toISOString(),
});

// What waits for a busy conversation is a wake-up it owns, and each release wakes the one that waited longest
@Injectable()
export class AgentChatWaitingLineService {
  constructor(
    @InjectWorkspaceScopedRepository(PendingWakeUpEntity)
    private readonly wakeUpRepository: WorkspaceScopedRepository<PendingWakeUpEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly pendingWakeUpService: PendingWakeUpService,
  ) {}

  async waitWithRun({
    workspaceId,
    threadId,
    run,
  }: {
    workspaceId: string;
    threadId: string;
    run: AgentChatWaitingRun;
  }): Promise<void> {
    await this.armRun({ workspaceId, threadId, run });
    await this.wakeNextIfReleased({ workspaceId, threadId });
  }

  async armRun({
    workspaceId,
    threadId,
    run,
  }: {
    workspaceId: string;
    threadId: string;
    run: AgentChatWaitingRun;
  }): Promise<void> {
    await this.pendingWakeUpService.arm({
      workspaceId,
      owner: { type: RUN, id: threadId, key: v4() },
      condition: buildRecheckCondition(),
      payload: run,
    });
  }

  // A waiter already in line keeps its place, as the messages it stands for are sent oldest first.
  // Held messages wait for the next release instead of a recheck, such as those a run is about to take
  async waitWithQueuedMessages({
    workspaceId,
    threadId,
    isHeld = false,
  }: {
    workspaceId: string;
    threadId: string;
    isHeld?: boolean;
  }): Promise<void> {
    const queuedMessagesWaiter = await this.findQueuedMessagesWaiter({
      workspaceId,
      threadId,
    });

    if (!isDefined(queuedMessagesWaiter)) {
      await this.pendingWakeUpService.arm({
        workspaceId,
        owner: {
          type: QUEUED_MESSAGES,
          id: threadId,
          key: QUEUED_MESSAGES_WAITER_KEY,
        },
        condition: isHeld
          ? { type: 'CONVERSATION_RELEASE', threadId }
          : buildRecheckCondition(),
      });
    } else if (isHeld) {
      await this.holdQueuedMessages(queuedMessagesWaiter);
    }

    if (!isHeld) {
      await this.wakeNextIfReleased({ workspaceId, threadId });
    }
  }

  async holdQueuedMessages(
    queuedMessagesWaiter: PendingWakeUpEntity,
  ): Promise<void> {
    if (queuedMessagesWaiter.condition.type !== 'CONVERSATION_RELEASE') {
      await this.pendingWakeUpService.rearm({
        wakeUp: queuedMessagesWaiter,
        condition: {
          type: 'CONVERSATION_RELEASE',
          threadId: queuedMessagesWaiter.ownerId,
        },
      });
    }
  }

  async keepWaiting(wakeUp: PendingWakeUpEntity): Promise<void> {
    await this.pendingWakeUpService.rearm({
      wakeUp,
      condition: buildRecheckCondition(),
    });
  }

  // a member who stopped the turn, or a run about to take the queue itself, holds the queued messages
  async wakeNext({
    workspaceId,
    threadId,
    shouldHoldQueuedMessages = false,
  }: {
    workspaceId: string;
    threadId: string;
    shouldHoldQueuedMessages?: boolean;
  }): Promise<void> {
    const queuedMessagesWaiter = shouldHoldQueuedMessages
      ? await this.findQueuedMessagesWaiter({ workspaceId, threadId })
      : null;

    if (isDefined(queuedMessagesWaiter)) {
      await this.holdQueuedMessages(queuedMessagesWaiter);
    }

    const nextWaiter = await this.wakeUpRepository.findOne(workspaceId, {
      where: {
        ownerId: threadId,
        ownerType: shouldHoldQueuedMessages ? RUN : In([RUN, QUEUED_MESSAGES]),
      },
      order: { createdAt: 'ASC' },
      select: ['id', 'workspaceId', 'ownerType', 'ownerId'],
    });

    if (isDefined(nextWaiter)) {
      await this.pendingWakeUpService.scheduleResolution({
        wakeUp: nextWaiter,
      });
    }
  }

  // the conversation may have been released between a failed claim and the wait
  async wakeNextIfReleased({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    if (!isDefined(await this.findBusyThread({ workspaceId, threadId }))) {
      await this.wakeNext({ workspaceId, threadId });
    }
  }

  async findBusyThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<Pick<
    AgentChatThreadWorkspaceEntity,
    'id' | 'activeStreamId'
  > | null> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId'],
    });

    return isNonEmptyString(thread?.activeStreamId) ? thread : null;
  }

  private async findQueuedMessagesWaiter({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<PendingWakeUpEntity | null> {
    return this.wakeUpRepository.findOne(workspaceId, {
      where: { ownerType: QUEUED_MESSAGES, ownerId: threadId },
    });
  }
}
