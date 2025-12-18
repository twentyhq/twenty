import { Injectable } from '@nestjs/common';

import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

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
}
