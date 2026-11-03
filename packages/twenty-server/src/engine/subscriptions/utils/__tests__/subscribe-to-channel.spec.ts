import { subscribeToChannel } from 'src/engine/subscriptions/utils/subscribe-to-channel';

const buildPubSub = () => {
  let deliver: (payload: string) => void = () => {};
  let resolveSubscribed: (subscriptionId: number) => void = () => {};
  const pubSub = {
    subscribe: jest.fn(
      (_channel: string, onMessage: (payload: string) => void) => {
        deliver = onMessage;

        return new Promise<number>((resolve) => {
          resolveSubscribed = resolve;
        });
      },
    ),
    unsubscribe: jest.fn(),
  };

  return {
    pubSub,
    deliver: (payload: string) => deliver(payload),
    acknowledgeSubscription: () => resolveSubscribed(7),
  };
};

describe('subscribeToChannel', () => {
  it('resolves only once the channel is subscribed', async () => {
    const { pubSub, acknowledgeSubscription } = buildPubSub();
    let isResolved = false;

    const subscription = subscribeToChannel<string>({
      pubSub: pubSub as never,
      channel: 'channel',
    }).then((iterator) => {
      isResolved = true;

      return iterator;
    });

    await Promise.resolve();
    expect(pubSub.subscribe).toHaveBeenCalledWith(
      'channel',
      expect.any(Function),
    );
    expect(isResolved).toBe(false);

    acknowledgeSubscription();
    await subscription;
    expect(isResolved).toBe(true);
  });

  it('keeps what is published before it is read, in order', async () => {
    const { pubSub, deliver, acknowledgeSubscription } = buildPubSub();
    const subscription = subscribeToChannel<string>({
      pubSub: pubSub as never,
      channel: 'channel',
    });

    acknowledgeSubscription();

    const iterator = await subscription;

    deliver('first');
    deliver('second');

    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: 'first',
    });
    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: 'second',
    });

    const pendingRead = iterator.next();

    deliver('third');
    await expect(pendingRead).resolves.toEqual({
      done: false,
      value: 'third',
    });
  });

  it('unsubscribes and ends a pending read on return', async () => {
    const { pubSub, acknowledgeSubscription } = buildPubSub();
    const subscription = subscribeToChannel<string>({
      pubSub: pubSub as never,
      channel: 'channel',
    });

    acknowledgeSubscription();

    const iterator = await subscription;
    const pendingRead = iterator.next();

    await iterator.return?.();

    await expect(pendingRead).resolves.toEqual({
      done: true,
      value: undefined,
    });
    await expect(iterator.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(pubSub.unsubscribe).toHaveBeenCalledTimes(1);
    expect(pubSub.unsubscribe).toHaveBeenCalledWith(7);
  });
});
