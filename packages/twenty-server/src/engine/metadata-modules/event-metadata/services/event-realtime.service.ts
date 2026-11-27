import { Injectable } from '@nestjs/common';

import { type EventOccurrence } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { EVENT_OCCURRENCE_ID_RETENTION_MS } from 'src/engine/metadata-modules/event-metadata/constants/event-occurrence-id-retention-ms.constant';

@Injectable()
export class EventRealtimeService {
  constructor(private readonly redisClientService: RedisClientService) {}

  async publish({
    channels,
    serializedOccurrence,
  }: {
    channels: string[];
    serializedOccurrence: string;
  }): Promise<void> {
    const pubSubClient = this.redisClientService.getPubSubClient();
    const payload = Buffer.from(serializedOccurrence);

    await Promise.all(
      channels.map((channel) => pubSubClient.publish(channel, payload)),
    );
  }

  // Returns when the id was first emitted, or null when this emission is the first
  async claimOccurrenceId({
    workspaceId,
    applicationId,
    occurrenceId,
    occurredAt,
  }: {
    workspaceId: string;
    applicationId: string;
    occurrenceId: string;
    occurredAt: string;
  }): Promise<string | null> {
    const redisClient = this.redisClientService.getClient();
    const key = `appEventOccurrence:${workspaceId}:${applicationId}:${occurrenceId}`;

    const claimed = await redisClient.set(
      key,
      occurredAt,
      'PX',
      EVENT_OCCURRENCE_ID_RETENTION_MS,
      'NX',
    );

    return claimed === 'OK' ? null : await redisClient.get(key);
  }

  // Resolves once Redis has acknowledged every subscription, so nothing published afterwards is missed
  async subscribe({
    channels,
    onOccurrence,
  }: {
    channels: string[];
    onOccurrence: (occurrence: EventOccurrence) => void;
  }): Promise<() => void> {
    const pubSubClient = this.redisClientService.getPubSubClient();

    const subscriptionIds = await Promise.all(
      channels.map((channel) => pubSubClient.subscribe(channel, onOccurrence)),
    );

    return () => {
      // Streams still open at shutdown close after Redis has quit, and an unsubscribe then rejects unhandled
      if (pubSubClient.getSubscriber().status === 'end') {
        return;
      }

      subscriptionIds.forEach((subscriptionId) =>
        pubSubClient.unsubscribe(subscriptionId),
      );
    };
  }

  // RedisPubSub.asyncIterator only subscribes on its first next(), after the client is told it is connected
  async subscribeToOccurrences({
    channels,
  }: {
    channels: string[];
  }): Promise<AsyncIterableIterator<EventOccurrence>> {
    const bufferedOccurrences: EventOccurrence[] = [];
    let pendingNext:
      | ((result: IteratorResult<EventOccurrence, undefined>) => void)
      | undefined;
    let isDone = false;

    const unsubscribe = await this.subscribe({
      channels,
      onOccurrence: (occurrence) => {
        if (isDone) {
          return;
        }

        if (isDefined(pendingNext)) {
          const resolveNext = pendingNext;

          pendingNext = undefined;
          resolveNext({ done: false, value: occurrence });
        } else {
          bufferedOccurrences.push(occurrence);
        }
      },
    });

    const finish = async (): Promise<IteratorResult<EventOccurrence>> => {
      if (!isDone) {
        isDone = true;
        unsubscribe();
        bufferedOccurrences.length = 0;
        pendingNext?.({ done: true, value: undefined });
        pendingNext = undefined;
      }

      return { done: true, value: undefined };
    };

    return {
      next: () => {
        const bufferedOccurrence = bufferedOccurrences.shift();

        if (isDefined(bufferedOccurrence)) {
          return Promise.resolve({ done: false, value: bufferedOccurrence });
        }

        if (isDone) {
          return Promise.resolve({ done: true, value: undefined });
        }

        return new Promise((resolve) => {
          pendingNext = resolve;
        });
      },
      return: finish,
      throw: async (error: unknown) => {
        await finish();
        throw error;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
}
