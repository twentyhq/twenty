import { Inject, Injectable } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

export enum SUBSCRIPTION_CHANNEL {
  DATABASE_EVENT_CHANNEL = 'DATABASE_EVENT_CHANNEL',
  SERVERLESS_FUNCTION_LOGS_CHANNEL = 'SERVERLESS_FUNCTION_LOGS_CHANNEL',
}

@Injectable()
export class SubscriptionService {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  private getSubscriptionChannel({
    channel,
    workspaceId,
  }: {
    channel: SUBSCRIPTION_CHANNEL;
    workspaceId: string;
  }) {
    return `${channel}:${workspaceId}`;
  }

  async subscribe({
    channel,
    workspaceId,
  }: {
    channel: SUBSCRIPTION_CHANNEL;
    workspaceId: string;
  }): Promise<void> {
    return this.pubSub.asyncIterator(
      this.getSubscriptionChannel({ channel, workspaceId }),
    );
  }

  async publish({
    channel,
    payload,
    workspaceId,
  }: {
    channel: SUBSCRIPTION_CHANNEL;
    payload: object;
    workspaceId: string;
  }): Promise<void> {
    await this.pubSub.publish(
      this.getSubscriptionChannel({ channel, workspaceId }),
      {
        [channel]: payload,
      },
    );
  }
}
