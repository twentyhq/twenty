import { Injectable } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';

const STOP_REQUEST_TTL_SECONDS = 3600;

type AgentRunStopTarget = {
  workspaceId: string;
  streamChannelId: string;
};

// stops a run followed by its stream channel, which runs in another request, maybe on another server
@Injectable()
export class AgentRunStopService {
  constructor(
    private readonly redisClientService: RedisClientService,
    private readonly cancelSubscriberService: AgentChatCancelSubscriberService,
  ) {}

  private getStopRequestKey({
    workspaceId,
    streamChannelId,
  }: AgentRunStopTarget): string {
    return `agent-run-stop-request:${workspaceId}:${streamChannelId}`;
  }

  private getStopChannel({
    workspaceId,
    streamChannelId,
  }: AgentRunStopTarget): string {
    return `agent-run-stop:${workspaceId}:${streamChannelId}`;
  }

  async requestStop(target: AgentRunStopTarget): Promise<void> {
    const redis = this.redisClientService.getClient();

    // kept as well as published, since a caller can stop a run before the run starts listening
    await redis.set(
      this.getStopRequestKey(target),
      '1',
      'EX',
      STOP_REQUEST_TTL_SECONDS,
    );
    await redis.publish(this.getStopChannel(target), 'stop');
  }

  async runStoppable<TResult>({
    work,
    ...target
  }: AgentRunStopTarget & {
    work: (abortSignal: AbortSignal) => Promise<TResult>;
  }): Promise<TResult> {
    const abortController = new AbortController();
    const stopChannel = this.getStopChannel(target);

    const unsubscribe = await this.cancelSubscriberService.subscribe(
      stopChannel,
      () => abortController.abort(),
    );

    try {
      // read after subscribing, so a stop is either kept or heard
      const isStopRequested =
        (await this.redisClientService
          .getClient()
          .exists(this.getStopRequestKey(target))) > 0;

      if (isStopRequested) {
        abortController.abort();
      }

      return await work(abortController.signal);
    } finally {
      await unsubscribe();
    }
  }
}
