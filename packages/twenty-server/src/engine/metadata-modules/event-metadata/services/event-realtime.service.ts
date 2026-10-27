import { Injectable } from '@nestjs/common';

import { type EventOccurrence } from 'twenty-shared/application';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

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
}
