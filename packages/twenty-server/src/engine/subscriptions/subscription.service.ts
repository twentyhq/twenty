import { Inject, Injectable } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

@Injectable()
export class SubscriptionService {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

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
    return this.pubSub.asyncIterator(
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
    await this.pubSub.publish(
      this.getSubscriptionChannel({ channel, workspaceId }),
      payload,
    );
  }
}
