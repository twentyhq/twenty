import { type RedisPubSub } from 'graphql-redis-subscriptions';
import { isDefined } from 'twenty-shared/utils';

// subscribed once it resolves, unlike RedisPubSub's asyncIterator, which subscribes on its first read
export const subscribeToChannel = async <TPayload>({
  pubSub,
  channel,
}: {
  pubSub: Pick<RedisPubSub, 'subscribe' | 'unsubscribe'>;
  channel: string;
}): Promise<AsyncIterableIterator<TPayload>> => {
  const receivedResults: IteratorResult<TPayload>[] = [];
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

      receivedResults.push({ done: false, value: payload });
    },
  );

  const close = async (): Promise<IteratorResult<TPayload>> => {
    if (!isClosed) {
      isClosed = true;
      pubSub.unsubscribe(subscriptionId);
      receivedResults.length = 0;
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

      const receivedResult = receivedResults.shift();

      if (isDefined(receivedResult)) {
        return Promise.resolve(receivedResult);
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
