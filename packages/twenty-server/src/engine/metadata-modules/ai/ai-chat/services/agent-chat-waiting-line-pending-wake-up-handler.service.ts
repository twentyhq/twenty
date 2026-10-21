import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { AGENT_CHAT_WAITING_LINE_OWNER_TYPES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-line-owner-types.constant';
import { AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatWaitingLineService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-line.service';
import { type AgentChatWaitingRun } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-waiting-run.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';

// Resolves what waits in a conversation's line: a run starts in its own job, and the queued
// messages are sent one per turn, the waiter keeping its place until none is left
@Injectable()
export class AgentChatWaitingLinePendingWakeUpHandlerService
  implements PendingWakeUpOwnerHandler<PendingWakeUpEntity>, OnModuleInit
{
  private readonly logger = new Logger(
    AgentChatWaitingLinePendingWakeUpHandlerService.name,
  );

  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly waitingLineService: AgentChatWaitingLineService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly streamingService: AgentChatStreamingService,
    private readonly agentChatQueueService: AgentChatQueueService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  onModuleInit(): void {
    for (const ownerType of Object.values(
      AGENT_CHAT_WAITING_LINE_OWNER_TYPES,
    )) {
      this.pendingWakeUpOwnerHandlerRegistryService.register(ownerType, this);
    }
  }

  async getOwnerState(
    wakeUp: PendingWakeUpEntity,
  ): Promise<PendingWakeUpOwnerState<PendingWakeUpEntity>> {
    return { status: 'WAITING', owner: wakeUp };
  }

  // no record event wakes a waiter up, so nothing is read on its behalf
  async getReadPermissions(): Promise<never> {
    throw new Error('A conversation waiter reads no event record');
  }

  async resolve({ wakeUp }: { wakeUp: PendingWakeUpEntity }): Promise<void> {
    const { workspaceId, ownerId: threadId } = wakeUp;
    const busyThread = await this.waitingLineService.findBusyThread({
      workspaceId,
      threadId,
    });

    if (isDefined(busyThread)) {
      // armed again first, so the release a reap makes wakes the waiter under its fresh id
      await this.waitingLineService.keepWaiting(wakeUp);
      await this.streamRecoveryService.reapDeadStream({
        thread: busyThread,
        workspaceId,
      });

      return;
    }

    if (wakeUp.ownerType === AGENT_CHAT_WAITING_LINE_OWNER_TYPES.RUN) {
      await this.startRun(wakeUp);

      return;
    }

    await this.sendQueuedMessage(wakeUp);
  }

  // the job claims the conversation itself, and waits again if something else took it first
  private async startRun(wakeUp: PendingWakeUpEntity): Promise<void> {
    const { workspaceId, ownerId: threadId } = wakeUp;
    const claimedWakeUp = await this.pendingWakeUpService.claim({
      workspaceId,
      wakeUpId: wakeUp.id,
    });

    if (!isDefined(claimedWakeUp)) {
      return;
    }

    const run = claimedWakeUp.payload as AgentChatWaitingRun;

    try {
      await this.messageQueueService.add(run.jobName, run.jobData);
    } catch (error) {
      this.logger.error(
        `Failed to start a run waiting on thread ${threadId} in workspace ${workspaceId}, it waits again: ${formatErrorWithCause(error)}`,
      );
      await this.waitingLineService.armRun({ workspaceId, threadId, run });

      throw error;
    }
  }

  private async sendQueuedMessage(wakeUp: PendingWakeUpEntity): Promise<void> {
    const { workspaceId, ownerId: threadId } = wakeUp;
    const outcome = await this.streamingService.flushNextQueuedMessage({
      workspaceId,
      threadId,
    });

    switch (outcome) {
      case 'BUSY':
        if (
          await this.agentChatQueueService.hasQueuedMessages({
            workspaceId,
            threadId,
          })
        ) {
          await this.waitingLineService.keepWaiting(wakeUp);
        } else {
          await this.leaveLine(wakeUp);
        }

        return;
      case 'HELD':
        await this.waitingLineService.wakeNext({
          workspaceId,
          threadId,
          shouldHoldQueuedMessages: true,
        });

        return;
      case 'HANDED_TO_RUN':
        await this.waitingLineService.holdQueuedMessages(wakeUp);

        return;
      case 'NOTHING_SENT':
        await this.leaveLine(wakeUp);

        return;
      case 'GONE':
        await this.pendingWakeUpService.claim({
          workspaceId,
          wakeUpId: wakeUp.id,
        });

        return;
    }
  }

  // a member who queued meanwhile found the waiter still in line and armed none, so the queue is read again
  private async leaveLine(wakeUp: PendingWakeUpEntity): Promise<void> {
    const { workspaceId, ownerId: threadId } = wakeUp;
    const claimedWakeUp = await this.pendingWakeUpService.claim({
      workspaceId,
      wakeUpId: wakeUp.id,
    });

    if (!isDefined(claimedWakeUp)) {
      return;
    }

    if (
      await this.agentChatQueueService.hasQueuedMessages({
        workspaceId,
        threadId,
      })
    ) {
      await this.waitingLineService.waitWithQueuedMessages({
        workspaceId,
        threadId,
      });

      return;
    }

    await this.waitingLineService.wakeNextIfReleased({ workspaceId, threadId });
  }
}
