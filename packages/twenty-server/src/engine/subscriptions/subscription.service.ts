import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { filterMapAsyncIterator } from 'src/engine/subscriptions/utils/filter-map-async-iterator';

@Injectable()
export class SubscriptionService {
  constructor(private readonly redisClient: RedisClientService) {}

  private getSubscriptionChannel({
    channel,
    workspaceId,
  }: {
    channel: SubscriptionChannel;
    workspaceId: string;
  }) {
    return `${channel}:${workspaceId}`;
  }

  private getEventStreamChannel({
    workspaceId,
    eventStreamChannelId,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
  }) {
    return `${SubscriptionChannel.EVENT_STREAM_CHANNEL}:${workspaceId}:${eventStreamChannelId}`;
  }

  async subscribe<TPayload>({
    channel,
    workspaceId,
    mapPayload,
  }: {
    channel: SubscriptionChannel;
    workspaceId: string;
    mapPayload?: (payload: TPayload) => TPayload | undefined;
  }): Promise<AsyncIterableIterator<TPayload>> {
    const client = this.redisClient.getPubSubClient();

    const iterator = client.asyncIterator<TPayload>(
      this.getSubscriptionChannel({ channel, workspaceId }),
    );

    return isDefined(mapPayload)
      ? filterMapAsyncIterator(iterator, mapPayload)
      : iterator;
  }

  async subscribeToEventStream({
    workspaceId,
    eventStreamChannelId,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
  }) {
    const client = this.redisClient.getPubSubClient();

    return client.asyncIterator(
      this.getEventStreamChannel({ workspaceId, eventStreamChannelId }),
    );
  }

  async publish<T>({
    channel,
    payload,
    workspaceId,
  }: {
    channel: SubscriptionChannel;
    payload: T;
    workspaceId: string;
  }): Promise<void> {
    const client = this.redisClient.getPubSubClient();

    await client.publish(
      this.getSubscriptionChannel({ channel, workspaceId }),
      payload,
    );
  }

  async publishToEventStream<T>({
    workspaceId,
    eventStreamChannelId,
    payload,
  }: {
    workspaceId: string;
    eventStreamChannelId: string;
    payload: T;
  }): Promise<void> {
    const client = this.redisClient.getPubSubClient();

    await client.publish(
      this.getEventStreamChannel({ workspaceId, eventStreamChannelId }),
      payload,
    );
  }

  private getAgentChatChannel({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }) {
    return `${SubscriptionChannel.AGENT_CHAT_CHANNEL}:${workspaceId}:${threadId}`;
  }

  async subscribeToAgentChat({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }) {
    const client = this.redisClient.getPubSubClient();

    return client.asyncIterator(
      this.getAgentChatChannel({ workspaceId, threadId }),
    );
  }

  async publishToAgentChat<T>({
    workspaceId,
    threadId,
    payload,
  }: {
    workspaceId: string;
    threadId: string;
    payload: T;
  }): Promise<void> {
    const client = this.redisClient.getPubSubClient();

    await client.publish(
      this.getAgentChatChannel({ workspaceId, threadId }),
      payload,
    );
  }
}
