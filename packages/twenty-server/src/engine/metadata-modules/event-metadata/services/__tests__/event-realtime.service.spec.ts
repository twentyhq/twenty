import { type EventOccurrence } from 'twenty-shared/application';

import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';

const buildOccurrence = (id: string): EventOccurrence => ({
  id,
  type: 'messageAdded',
  occurredAt: '2026-10-28T00:00:00.000Z',
  properties: {},
});

describe('EventRealtimeService.subscribeToOccurrences', () => {
  let deliverOccurrence: (occurrence: EventOccurrence) => void;
  const unsubscribe = jest.fn();
  const subscribe = jest.fn(
    async (_channel: string, onMessage: (message: EventOccurrence) => void) => {
      deliverOccurrence = onMessage;

      return 1;
    },
  );

  const service = new EventRealtimeService({
    getPubSubClient: () => ({
      subscribe,
      unsubscribe,
      getSubscriber: () => ({ status: 'ready' }),
    }),
  } as unknown as RedisClientService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe before returning and keep occurrences received before the first read', async () => {
    const occurrences = await service.subscribeToOccurrences({
      channels: ['channel-1'],
    });

    expect(subscribe).toHaveBeenCalledWith('channel-1', expect.any(Function));

    deliverOccurrence(buildOccurrence('occurrence-1'));

    await expect(occurrences.next()).resolves.toEqual({
      done: false,
      value: buildOccurrence('occurrence-1'),
    });

    const pendingRead = occurrences.next();

    deliverOccurrence(buildOccurrence('occurrence-2'));

    await expect(pendingRead).resolves.toEqual({
      done: false,
      value: buildOccurrence('occurrence-2'),
    });
  });

  it('should end a pending read and unsubscribe when the stream is closed', async () => {
    const occurrences = await service.subscribeToOccurrences({
      channels: ['channel-1'],
    });
    const pendingRead = occurrences.next();

    await occurrences.return?.();

    await expect(pendingRead).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(unsubscribe).toHaveBeenCalledWith(1);
  });
});
