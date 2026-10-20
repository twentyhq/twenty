import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { AGENT_CHAT_PARKED_RUN_FALLBACK_DELAY_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-parked-run-fallback-delay-ms.constant';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

type ParkedRun = {
  jobName: string;
  jobData: object;
};

// the delayed copy of each parked run covers a claim whose worker died, which nothing else releases
@Injectable()
export class AgentChatParkedRunsService {
  private readonly logger = new Logger(AgentChatParkedRunsService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly redisClientService: RedisClientService,
  ) {}

  private getKey(threadId: string): string {
    return `agent-chat-parked-runs:${threadId}`;
  }

  async park<TJobData extends { parkId?: string }>({
    workspaceId,
    threadId,
    jobName,
    jobData: { parkId: _previousParkId, ...jobData },
  }: {
    workspaceId: string;
    threadId: string;
    jobName: string;
    jobData: TJobData;
  }): Promise<void> {
    const parkId = v4();
    const parkedRun: ParkedRun = { jobName, jobData };

    await this.redisClientService
      .getClient()
      .hset(this.getKey(threadId), parkId, JSON.stringify(parkedRun));

    await this.messageQueueService.add<TJobData>(
      jobName,
      { ...jobData, parkId } as TJobData,
      { delay: AGENT_CHAT_PARKED_RUN_FALLBACK_DELAY_MS },
    );

    // the conversation may have been released between the failed claim and the park
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId'],
    });

    if (!isNonEmptyString(thread?.activeStreamId)) {
      await this.wake({ workspaceId, threadId });
    }
  }

  // whether the job goes on: the delayed copy of a parked run does only when nothing woke the run first
  async shouldRunParkedJob({
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
      .hdel(this.getKey(threadId), parkId);

    return removedCount === 1;
  }

  async wake({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const parkedRunsHashKey = this.getKey(threadId);
    const results = await this.redisClientService
      .getClient()
      .multi()
      .hgetall(parkedRunsHashKey)
      .del(parkedRunsHashKey)
      .exec()
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to read the runs parked on thread ${threadId} in workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
        );

        return null;
      });
    const parkedRuns = (results?.[0]?.[1] ?? {}) as Record<string, string>;

    for (const [parkId, parkedRun] of Object.entries(parkedRuns)) {
      const { jobName, jobData } = JSON.parse(parkedRun) as ParkedRun;

      try {
        await this.messageQueueService.add(jobName, jobData);
      } catch (error) {
        this.logger.error(
          `Failed to wake a run parked on thread ${threadId} in workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
        );
        await this.redisClientService
          .getClient()
          .hset(parkedRunsHashKey, parkId, parkedRun)
          .catch((reParkError: unknown) =>
            this.logger.error(
              `Failed to park again a run on thread ${threadId} in workspace ${workspaceId}, only its delayed copy will run it: ${formatErrorWithCause(reParkError)}`,
            ),
          );
      }
    }
  }
}
