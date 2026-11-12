import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';

import type { Redis } from 'ioredis';
import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

// Single shared Redis subscriber connection per process for AI stream
// cancellation. Multiplexes all cancel channels onto one connection
// so we use exactly 1 Redis connection regardless of how many
// concurrent streams are running.
@Injectable()
export class AgentChatCancelSubscriberService implements OnModuleDestroy {
  private readonly logger = new Logger(AgentChatCancelSubscriberService.name);
  private subscriber: Redis | null = null;
  // a channel can have several listeners, such as two requests that raced for one run id
  private readonly callbacksByChannel = new Map<string, Set<() => void>>();

  constructor(private readonly redisClientService: RedisClientService) {}

  private ensureSubscriber(): Redis {
    if (!this.subscriber) {
      this.subscriber = this.redisClientService.getClient().duplicate();
      this.subscriber.on('message', (channel: string) => {
        const callbacks = this.callbacksByChannel.get(channel);

        if (!isDefined(callbacks)) {
          return;
        }

        this.callbacksByChannel.delete(channel);
        this.subscriber?.unsubscribe(channel).catch(() => {});
        callbacks.forEach((callback) => callback());
      });
    }

    return this.subscriber;
  }

  // resolves to this listener's own unsubscribe, which leaves the channel's other listeners in place
  async subscribe(
    channel: string,
    onCancel: () => void,
  ): Promise<() => Promise<void>> {
    const callbacks = this.callbacksByChannel.get(channel) ?? new Set();

    callbacks.add(onCancel);
    this.callbacksByChannel.set(channel, callbacks);
    await this.ensureSubscriber().subscribe(channel);

    return async () => {
      const currentCallbacks = this.callbacksByChannel.get(channel);

      if (!currentCallbacks?.delete(onCancel) || currentCallbacks.size > 0) {
        return;
      }

      this.callbacksByChannel.delete(channel);
      await this.subscriber?.unsubscribe(channel).catch(() => {});
    };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.quit().catch(() => {});
      this.subscriber = null;
    }

    this.callbacksByChannel.clear();
  }
}
