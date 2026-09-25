import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';

describe('Subscription authorization cache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1000);
  });
  afterEach(() => jest.useRealTimers());

  it('coalesces checks and expires successful authorization from the check start', async () => {
    let finish = () => {};
    const check = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const authorize = createSubscriptionAuthorization({
      check,
      maxAgeMs: 2000,
    });
    const first = authorize();
    const second = authorize();
    await Promise.resolve();
    expect(check).toHaveBeenCalledTimes(1);
    jest.setSystemTime(2500);
    finish();
    await Promise.all([first, second]);
    await authorize();
    expect(check).toHaveBeenCalledTimes(1);
    check.mockResolvedValue(undefined);
    jest.setSystemTime(3000);
    await authorize();
    expect(check).toHaveBeenCalledTimes(2);
  });

  it('blocks cached event delivery behind a forced heartbeat check and keeps failures terminal', async () => {
    const check = jest.fn().mockResolvedValue(undefined);
    const authorize = createSubscriptionAuthorization({
      check,
      maxAgeMs: 2000,
    });
    await authorize();
    let reject = (_error: Error) => {};
    check.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, rejectPromise) => {
          reject = rejectPromise;
        }),
    );
    const heartbeat = authorize(true);
    const event = authorize();
    const heartbeatFailure = expect(heartbeat).rejects.toThrow('revoked');
    const eventFailure = expect(event).rejects.toThrow('revoked');
    await Promise.resolve();
    reject(new Error('revoked'));
    await Promise.all([heartbeatFailure, eventFailure]);
    jest.setSystemTime(10000);
    await expect(authorize(true)).rejects.toThrow('revoked');
    expect(check).toHaveBeenCalledTimes(2);
  });
});
