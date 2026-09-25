import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

const WORKSPACE_ID = 'workspace-id';

const buildSubscriptionService = (publishedPayloads: number[]) => {
  const asyncIterator = jest.fn().mockReturnValue(
    (async function* () {
      yield* publishedPayloads;
    })(),
  );

  const subscriptionService = new SubscriptionService({
    getPubSubClient: () => ({ asyncIterator }),
  } as unknown as RedisClientService);

  return { asyncIterator, subscriptionService };
};

const collect = async <TValue>(iterator: AsyncIterableIterator<TValue>) => {
  const values: TValue[] = [];

  for await (const value of iterator) {
    values.push(value);
  }

  return values;
};

describe('SubscriptionService', () => {
  it('should receive every payload published on the workspace channel', async () => {
    const { asyncIterator, subscriptionService } = buildSubscriptionService([
      1, 2, 3,
    ]);

    const iterator = await subscriptionService.subscribe<number>({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId: WORKSPACE_ID,
    });

    expect(asyncIterator).toHaveBeenCalledWith(
      `${SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL}:${WORKSPACE_ID}`,
    );
    expect(await collect(iterator)).toEqual([1, 2, 3]);
  });

  it('should map payloads and drop the ones mapped to undefined', async () => {
    const { subscriptionService } = buildSubscriptionService([1, 2, 3]);

    const iterator = await subscriptionService.subscribe<number>({
      channel: SubscriptionChannel.LOGIC_FUNCTION_LOGS_CHANNEL,
      workspaceId: WORKSPACE_ID,
      mapPayload: (payload) => (payload === 2 ? undefined : payload * 10),
    });

    expect(await collect(iterator)).toEqual([10, 30]);
  });
});
