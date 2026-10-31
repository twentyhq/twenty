import { type RedisPubSub } from 'graphql-redis-subscriptions';
import { isDefined } from 'twenty-shared/utils';

// Subscribed once it resolves, so it gets whatever is published afterwards. RedisPubSub's asyncIterator
// subscribes on its first read instead, which can come after a subscriber was told it is live
export const subscribeToChannel = async <TPayload>({
  pubSub,
  channel,
}: {
  pubSub: Pick<RedisPubSub, 'subscribe' | 'unsubscribe'>;
  channel: string;
}): Promise<AsyncIterableIterator<TPayload>> => {
  const receivedPayloads: TPayload[] = [];
  const pendingReads: ((result: IteratorResult<TPayload>) => void)[] = [];
  let isClosed = false;

  const subscriptionId = await pubSub.subscribe<TPayload>(
    channel,
    (payload) => {
      const pendingRead = pendingReads.shift();

      if (isDefined(pendingRead)) {
        pendingRead({ done: false, value: payload });

        return;
      }

      receivedPayloads.push(payload);
    },
  );

  const close = async (): Promise<IteratorResult<TPayload>> => {
    if (!isClosed) {
      isClosed = true;
      pubSub.unsubscribe(subscriptionId);
      receivedPayloads.length = 0;
      pendingReads
        .splice(0)
        .forEach((pendingRead) =>
          pendingRead({ done: true, value: undefined }),
        );
    }

    return { done: true, value: undefined };
  };

  return {
    next: () => {
      if (isClosed) {
        return close();
      }

      if (receivedPayloads.length > 0) {
        return Promise.resolve({
          done: false,
          value: receivedPayloads.shift() as TPayload,
        });
      }

      return new Promise((resolve) => pendingReads.push(resolve));
    },
    return: close,
    throw: async (error: unknown) => {
      await close();

      throw error;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};
