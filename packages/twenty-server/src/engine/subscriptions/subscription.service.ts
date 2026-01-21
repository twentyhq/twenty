import { Injectable } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

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

  async subscribe({
    channel,
    workspaceId,
  }: {
    channel: SubscriptionChannel;
    workspaceId: string;
  }) {
    const client = this.redisClient.getPubSubClient();

    return client.asyncIterator(
      this.getSubscriptionChannel({ channel, workspaceId }),
    );
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
}
