import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';
import { v4 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { AGENT_CHAT_WAITING_RUN_OWNER_TYPE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-run-owner-type.constant';
import { AGENT_CHAT_WAITING_RUN_RECHECK_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-run-recheck-delay-ms.constant';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

type AgentChatWaitingRun = { jobName: string; jobData: object };

// the recheck reaps a holder whose worker died, which nothing else releases
const buildRecheckAt = () =>
  new Date(Date.now() + AGENT_CHAT_WAITING_RUN_RECHECK_DELAY_MS);

@Injectable()
export class AgentChatWaitingRunService
  implements PendingWakeUpOwnerHandler<PendingWakeUpEntity>, OnModuleInit
{
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly redisClientService: RedisClientService,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register(
      AGENT_CHAT_WAITING_RUN_OWNER_TYPE,
      this,
    );
  }

  async wait({
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
      owner: {
        type: AGENT_CHAT_WAITING_RUN_OWNER_TYPE,
        id: threadId,
        key: v4(),
      },
      condition: { type: 'TIME', resumeAt: buildRecheckAt().toISOString() },
      payload: run,
    });

    // the conversation may have been released between the failed claim and the wait
    if (
      await this.threadRepository.existsBy(workspaceId, {
        id: threadId,
        activeStreamId: IsNull(),
      })
    ) {
      await this.streamRecoveryService.wakeNext({
        workspaceId,
        threadId,
        shouldFlush: true,
      });
    }
  }

  // a run the previous release parked in Redis runs from its delayed copy only if no release woke it first
  async shouldRunLegacyParkedCopy({
    threadId,
    parkId,
  }: {
    threadId: string;
    parkId?: string;
  }): Promise<boolean> {
    if (!isDefined(parkId)) {
      return true;
    }

    const removedCount = await this.redisClientService
      .getClient()
      .hdel(`agent-chat-parked-runs:${threadId}`, parkId);

    return removedCount === 1;
  }

  async getOwnerState(wakeUp: PendingWakeUpEntity) {
    return { status: 'WAITING' as const, owner: wakeUp };
  }

  async getReadPermissions(): Promise<never> {
    throw new Error('A waiting run reads no event record');
  }

  async resolve({ wakeUp }: { wakeUp: PendingWakeUpEntity }): Promise<void> {
    const { workspaceId, ownerId: threadId } = wakeUp;
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId'],
    });

    if (isDefined(thread) && isNonEmptyString(thread.activeStreamId)) {
      // rearmed before the reap, so the release it makes wakes the fresh id
      await this.pendingWakeUpService.rearm({
        wakeUp,
        resumeAt: buildRecheckAt(),
      });
      await this.streamRecoveryService.reapDeadStream({ thread, workspaceId });

      return;
    }

    const claimedWakeUp = await this.pendingWakeUpService.claim({
      workspaceId,
      wakeUpId: wakeUp.id,
    });

    if (!isDefined(thread) || !isDefined(claimedWakeUp)) {
      return;
    }

    const run = claimedWakeUp.payload as AgentChatWaitingRun;

    try {
      await this.messageQueueService.add(run.jobName, run.jobData);
    } catch (error) {
      await this.wait({ workspaceId, threadId, run });

      throw error;
    }
  }
}
